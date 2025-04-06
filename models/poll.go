package models

import (
	"gorm.io/gorm"
)

type Poll struct {
	gorm.Model
	UUID     string `gorm:"type:varchar(36);uniqueIndex"`
	Question string
	Options  []Option `gorm:"foreignKey:PollID;constraint:OnDelete:CASCADE;"`
	Votes    []Vote   `gorm:"foreignKey:PollID;constraint:OnDelete:CASCADE;"`
}

type Option struct {
	gorm.Model
	PollID uint `gorm:"index"`
	Text   string
	// Votes are linked via Vote model
}
