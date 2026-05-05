package main

import (
	"log"

	"backend/modules/chat"
	"backend/modules/rooms"
	"backend/modules/view"

	"github.com/gofiber/fiber/v3"
)

func main() {
	roomsService := roomsModule.NewService()

	cfg := fiber.Config{}
	cfg.Services = append(cfg.Services, roomsService)

	app := fiber.New(cfg)

	chatModule.NewController(roomsService).Register(app)
	roomsModule.NewController(roomsService).Register(app)
	viewModule.NewController().Register(app)

	log.Fatal(app.Listen(":3000"))
}
