package main

import (
	"html/template"
	"log" // Make sure log is imported
	"net/http"
	"os"
	"strings"
	"vote-wave/db"
	"vote-wave/handlers"

	"github.com/gin-gonic/gin"
)

func main() {
	// Determine base URL
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	baseURL := "http://localhost:" + port
	log.Println("Base URL determined:", baseURL) // Log BaseURL

	db.ConnectDatabase()
	log.Println("Database connected.") // Log DB connection

	router := gin.Default()
	log.Println("Gin router initialized.") // Log router init

	// Add BaseURL to all template renderings
	router.SetFuncMap(template.FuncMap{
		"add": func(a, b int) int {
			return a + b
		},
		"BaseURL": func() string {
			return baseURL
		},
	})
	log.Println("Template FuncMap set.") // Log FuncMap

	// Load templates
	router.LoadHTMLGlob("templates/*.html")
	// Check if templates were loaded (Gin panics on error here, but let's log before)
	log.Println("Attempted to load templates from 'templates/*.html'")

	router.Static("/static", "./static")
	log.Println("Static file route '/static' configured for './static'")

	// Routes
	router.GET("/", handlers.ShowCreatePollForm)
	log.Println("Route GET '/' registered")
	router.POST("/poll", handlers.CreatePoll)
	log.Println("Route POST '/poll' registered")
	router.GET("/poll/:uuid", func(c *gin.Context) {
		log.Printf("Handling GET /poll/%s\n", c.Param("uuid")) // Log specific poll GET
		handlers.ShowPoll(c)
	})
	log.Println("Route GET '/poll/:uuid' registered")
	router.POST("/poll/:uuid/vote", func(c *gin.Context) {
		log.Printf("Handling POST /poll/%s/vote\n", c.Param("uuid")) // Log specific vote POST
		handlers.SubmitVote(c)
	})
	log.Println("Route POST '/poll/:uuid/vote' registered")

	// Middleware
	router.Use(gin.Logger()) // Use Gin's built-in logger first
	log.Println("Gin logger middleware enabled.")

	// Trailing slash middleware
	router.Use(func(c *gin.Context) {
		if c.Request.URL.Path != "/" && strings.HasSuffix(c.Request.URL.Path, "/") {
			log.Printf("Redirecting trailing slash for %s\n", c.Request.URL.Path)
			c.Redirect(http.StatusMovedPermanently, strings.TrimSuffix(c.Request.URL.Path, "/"))
			c.Abort()
			return
		}
		c.Next()
	})
	log.Println("Trailing slash middleware enabled.")

	log.Printf("Server starting on %s\n", baseURL)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
