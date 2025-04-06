package handlers

import (
	"net/http"
	"vote-wave/db"
	"vote-wave/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ShowCreatePollForm(c *gin.Context) {
	c.HTML(http.StatusOK, "create_poll.html", gin.H{
		"Title": "Create New Poll",
	})
}

func CreatePoll(c *gin.Context) {
	question := c.PostForm("question")
	options := c.PostFormArray("options") // Expect multiple 'options' fields

	if question == "" || len(options) < 2 {
		c.HTML(http.StatusBadRequest, "create_poll.html", gin.H{
			"Title": "Create New Poll",
			"Error": "Please provide a question and at least two options.",
		})
		return
	}

	poll := models.Poll{
		UUID:     uuid.NewString(),
		Question: question,
	}

	result := db.DB.Create(&poll)
	if result.Error != nil {
		c.HTML(http.StatusInternalServerError, "create_poll.html", gin.H{
			"Title": "Create New Poll",
			"Error": "Failed to create poll.",
		})
		return
	}

	for _, optText := range options {
		if optText != "" { // Ignore empty option fields
			option := models.Option{
				PollID: poll.ID,
				Text:   optText,
			}
			db.DB.Create(&option) // Add error handling if needed
		}
	}

	// Redirect to the newly created poll page
	c.Redirect(http.StatusFound, "/poll/"+poll.UUID)
}

func ShowPoll(c *gin.Context) {
	pollUUID := c.Param("uuid")
	var poll models.Poll

	// Preload Options to avoid separate queries
	result := db.DB.Preload("Options").Where("uuid = ?", pollUUID).First(&poll)
	if result.Error != nil {
		c.HTML(http.StatusNotFound, "error.html", gin.H{ // Assuming you have an error.html template
			"Title":   "Error",
			"Message": "Poll not found.",
		})
		return
	}

	// Render the voting view
	c.HTML(http.StatusOK, "view_poll.html", gin.H{
		"Title":    "Vote",
		"Poll":     poll,
		"PollUUID": pollUUID, // Pass UUID for form action
	})
}
