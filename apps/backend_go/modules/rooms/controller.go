package roomsModule

import (
	"github.com/gofiber/fiber/v3"
)

type CreateRoomRequestBody struct {
	RoomId string `json:"roomId"`
	AuthKey string `json:"authKey"`
}

type RoomsController struct {
	roomsService *RoomsService
}

func NewController(roomsService *RoomsService) *RoomsController {
	return &RoomsController{roomsService: roomsService}
}

func (rc *RoomsController) Register(app *fiber.App) {
	app.Post("/api/room", func (c fiber.Ctx) error {
		body := new(CreateRoomRequestBody)

		if err := c.Bind().Body(body); err != nil {
			return c.JSON(fiber.Map{
				"ok": false,
				"error": "wrong_arguments",
			})
    }

		rc.roomsService.CreateRoom(body.RoomId, body.AuthKey)

		return c.JSON(fiber.Map{
			"ok": true,
		})
	})
}
