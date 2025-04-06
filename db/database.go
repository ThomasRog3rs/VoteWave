package db

import (
	"log"
	"vote-wave/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("vote_wave.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // Keep logs clean
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = database.AutoMigrate(&models.Poll{}, &models.Option{}, &models.Vote{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = database
}
