package handlers

import (
	"net/http"
	"strconv"
	"vote-wave/db"
	"vote-wave/models"

	"github.com/gin-gonic/gin"
)

func SubmitVote(c *gin.Context) {
	pollUUID := c.Param("uuid")
	username := c.PostForm("username")
	optionIDStr := c.PostForm("option_id")

	if username == "" || optionIDStr == "" {
		// This error won't be nicely displayed with HTMX swap,
		// consider client-side validation or a different error handling approach
		c.String(http.StatusBadRequest, "Username and option selection are required.")
		return
	}

	optionID, err := strconv.ParseUint(optionIDStr, 10, 64)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid option ID.")
		return
	}

	var poll models.Poll
	result := db.DB.Where("uuid = ?", pollUUID).First(&poll)
	if result.Error != nil {
		c.String(http.StatusNotFound, "Poll not found.")
		return
	}

	// Check if user already voted (using the unique constraint)
	vote := models.Vote{
		PollID:   poll.ID,
		OptionID: uint(optionID),
		Username: username,
	}

	tx := db.DB.Begin() // Start transaction for atomicity

	// Attempt to create the vote. GORM handles the unique constraint check.
	result = tx.Create(&vote)
	if result.Error != nil {
		tx.Rollback()
		// Check if the error is specifically a unique constraint violation
		// This check might need adjustment depending on the exact SQLite error message/code
		// For simplicity, we assume any error here means they likely already voted or DB issue
		c.String(http.StatusConflict, "You have already voted on this poll or an error occurred.")
		return
	}

	tx.Commit() // Commit transaction

	// Fetch results after successful vote
	RenderPollResults(c, pollUUID, poll.ID)
}

// Helper function to render results (used after voting and potentially for direct view)
func RenderPollResults(c *gin.Context, pollUUID string, pollID uint) {
	var poll models.Poll
	var options []models.Option
	var votes []models.Vote

	// Fetch poll details again (could optimize)
	db.DB.Where("uuid = ?", pollUUID).First(&poll)
	db.DB.Where("poll_id = ?", pollID).Find(&options)
	db.DB.Where("poll_id = ?", pollID).Find(&votes)

	// Calculate results
	results := make(map[uint]int) // Map Option ID to Vote Count
	totalVotes := 0
	for _, vote := range votes {
		results[vote.OptionID]++
		totalVotes++
	}

	// Prepare data for template
	type OptionResult struct {
		Text       string
		Count      int
		Percentage float64
	}
	optionResults := []OptionResult{}
	for _, opt := range options {
		count := results[opt.ID]
		percentage := 0.0
		if totalVotes > 0 {
			percentage = (float64(count) / float64(totalVotes)) * 100
		}
		optionResults = append(optionResults, OptionResult{
			Text:       opt.Text,
			Count:      count,
			Percentage: percentage,
		})
	}

	// Render the results partial using HTMX swap target
	c.HTML(http.StatusOK, "poll_results.html", gin.H{
		"Poll":          poll,
		"OptionResults": optionResults,
		"TotalVotes":    totalVotes,
	})
}
