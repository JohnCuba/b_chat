package chatModule

import (
	"log"
	"time"
	roomsModule "backend/modules/rooms"

	"github.com/gofiber/contrib/v3/websocket"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type ChatController struct {
	roomsService *roomsModule.RoomsService
}

func NewController(roomsService *roomsModule.RoomsService) *ChatController {
	return &ChatController{roomsService: roomsService}
}

func (cc *ChatController) Register(app *fiber.App) {
	go func() {
		ticker := time.NewTicker(time.Second * 10)
		defer ticker.Stop()
		for range ticker.C {
			handleConnectionsNotifier(cc.roomsService)
		}
	}()

	app.Use("/api/chat", func(c fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			c.Locals("id", uuid.New().String())
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/api/chat", websocket.New(func(c *websocket.Conn) {
		defer c.Close()

		if !handleOpenConnection(c, cc) {
			return
		}

		roomId := c.Query("id")
		connId := c.Locals("id").(string)

		defer func() {
			if room, exist := cc.roomsService.Get(roomId); exist {
				cc.roomsService.RemoveConnection(room, connId)
				cc.roomsService.DeletePendingChallenge(room, connId)
			}
		}()

		for {
			_, payload, err := c.ReadMessage()
			if err != nil {
				if !websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					log.Println("ws read:", err)
				}
				return
			}
			handleMessage(c, cc, payload)
		}
	}))
}
