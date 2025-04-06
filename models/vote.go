package models

import (
	"gorm.io/gorm"
)

type Vote struct {
	gorm.Model
	PollID   uint   `gorm:"uniqueIndex:idx_poll_user"` // Part of composite index
	OptionID uint   `gorm:"index"`
	Username string `gorm:"type:varchar(100);uniqueIndex:idx_poll_user"` // Part of composite index
}
