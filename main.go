package main

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"vote-wave/db"
	"vote-wave/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Determine base URL (simple approach)
	// For production, use environment variables or config files
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port
	}
	// Basic scheme/host detection - might need refinement for proxies etc.
	baseURL := "http://localhost:" + port

	db.ConnectDatabase()

	router := gin.Default()

	// Add BaseURL to all template renderings
	router.SetFuncMap(template.FuncMap{
		"add": func(a, b int) int {
			return a + b
		},
		"BaseURL": func() string {
			return baseURL
		},
	})

	router.LoadHTMLGlob("templates/*.html")
	router.Static("/static", "./static")

	// Routes
	router.GET("/", handlers.ShowCreatePollForm)
	router.POST("/poll", handlers.CreatePoll)
	router.GET("/poll/:uuid", func(c *gin.Context) {
		// Inject BaseURL specifically for this handler if needed,
		// though SetFuncMap should make it globally available.
		// c.Set("BaseURL", baseURL) // Alternative way
		handlers.ShowPoll(c)
	})
	router.POST("/poll/:uuid/vote", func(c *gin.Context) {
		// Inject BaseURL specifically for this handler if needed
		// c.Set("BaseURL", baseURL) // Alternative way
		handlers.SubmitVote(c)
	})

	// Simple middleware to log requests (Gin's default logger does this too)
	router.Use(gin.Logger())

	// Middleware to handle trailing slashes (optional but good practice)
	router.Use(func(c *gin.Context) {
		if c.Request.URL.Path != "/" && strings.HasSuffix(c.Request.URL.Path, "/") {
			c.Redirect(http.StatusMovedPermanently, strings.TrimSuffix(c.Request.URL.Path, "/"))
			c.Abort()
			return
		}
		c.Next()
	})

	log.Printf("Server starting on %s\n", baseURL)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
