package chatModule

import (
	roomsModule "backend/modules/rooms"
	"encoding/json"
	"log"
	"time"

	"github.com/gofiber/contrib/v3/websocket"
)

type clientMsg struct {
	Type  string `json:"type"`
	Proof string `json:"proof,omitempty"`
	Name  string `json:"name,omitempty"`
	Text  string `json:"text,omitempty"`
}

type typedMsg struct {
	Type string `json:"type"`
}

type challengeMsg struct {
	Type  string `json:"type"`
	Nonce string `json:"nonce"`
}

type errorMsg struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type connectionsMsg struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
}

type incomingChatMsg struct {
	Type string `json:"type"`
	Name string `json:"name"`
	Text string `json:"text"`
	Ts   int64  `json:"ts"`
}

func handleOpenConnection(c *websocket.Conn, cc *ChatController) bool {
	roomId := c.Query("id")
	connId := c.Locals("id").(string)

	room, exist := cc.roomsService.Get(roomId)
	if !exist {
		c.WriteJSON(errorMsg{Type: "error", Message: "room_not_found"})
		return false
	}

	nonce := cc.roomsService.AddPendingChallenge(room, connId)
	c.WriteJSON(challengeMsg{Type: "challenge", Nonce: nonce})
	return true
}

func handleMessage(c *websocket.Conn, cc *ChatController, payload []byte) {
	roomId := c.Query("id")
	connId := c.Locals("id").(string)

	room, exist := cc.roomsService.Get(roomId)
	if !exist {
		return
	}

	var msg clientMsg
	if err := json.Unmarshal(payload, &msg); err != nil {
		log.Println("ws decode:", err)
		return
	}

	pendingNonce, hasPending := cc.roomsService.GetPendingChallenge(room, connId)

	if hasPending {
		if msg.Type != "challenge_response" {
			c.WriteJSON(errorMsg{Type: "error", Message: "expected_challenge_response"})
			return
		}

		if !cc.roomsService.CheckChallenge(room, pendingNonce, msg.Proof) {
			c.WriteJSON(errorMsg{Type: "error", Message: "auth_failed"})
			c.Close()
			return
		}

		cc.roomsService.DeletePendingChallenge(room, connId)
		cc.roomsService.AddConnection(room, connId, c)
		c.WriteJSON(typedMsg{Type: "authenticated"})

		conns := cc.roomsService.GetConnections(room)
		count := len(conns)

		for _, conn := range conns {
			conn.WriteJSON(connectionsMsg{Type: "connections", Count: count})
		}
		return
	}

	if msg.Type == "message" {
		out := incomingChatMsg{
			Type: "message",
			Name: msg.Name,
			Text: msg.Text,
			Ts:   time.Now().UnixMilli(),
		}

		for id, conn := range cc.roomsService.GetConnections(room) {
			if id == connId { continue }

			conn.WriteJSON(out)
		}
	}
}

func handleConnectionsNotifier(roomsService *roomsModule.RoomsService) {
	for _, room := range roomsService.GetAllRooms() {
		connections := roomsService.GetConnections(room)
		count := len(connections)

		for _, conn := range connections {
			conn.WriteJSON(connectionsMsg{Type: "connections", Count: count})
		}
	}
}
