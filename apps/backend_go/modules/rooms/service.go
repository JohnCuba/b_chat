package roomsModule

import (
	"crypto/rand"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"context"
	"sync"

	"github.com/gofiber/contrib/v3/websocket"
)

const RoomsServiceName = "rooms-service"

type Room struct {
	AuthKey string
	pendingChallenges map[string]string
	connections map[string]*websocket.Conn
}

type RoomsService struct {
	mu    sync.RWMutex
	rooms map[string]Room
}

func NewService() *RoomsService {
	return &RoomsService{}
}

func (s *RoomsService) Start(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.rooms = map[string]Room{}
	return nil
}

func (s *RoomsService) String() string {
	return RoomsServiceName
}

func (s *RoomsService) State(ctx context.Context) (string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if s.rooms == nil {
		return "stopped", nil
	}
	return "running", nil
}

func (s *RoomsService) Terminate(ctx context.Context) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.rooms = nil
	return nil
}

func (s *RoomsService) CreateRoom(roomId string, authKey string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	_, existed := s.rooms[roomId]

	if (existed) { return }

	s.rooms[roomId] = Room{
		AuthKey: authKey,
		pendingChallenges: map[string]string { },
		connections: map[string]*websocket.Conn { },
	}
}

func (s *RoomsService) Get(roomId string) (Room, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	room, exist := s.rooms[roomId]

	return room, exist
}

func (s *RoomsService) GetAllRooms() map[string]Room {
	s.mu.Lock()
	defer s.mu.Unlock()

	return s.rooms
}

func (s *RoomsService) AddPendingChallenge(room Room, connId string) string {
	s.mu.Lock()
	defer s.mu.Unlock()

	bytes := make([]byte, 32)
	rand.Read(bytes)
	nonce := hex.EncodeToString(bytes)
	room.pendingChallenges[connId] = nonce

	return nonce
}

func (s *RoomsService) GetPendingChallenge(room Room, connId string) (string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	nonce, exist := room.pendingChallenges[connId]

	return nonce, exist
}

func (s *RoomsService) CheckChallenge(room Room, pendingNonce string, proof string) bool {
	authKey, err := hex.DecodeString(room.AuthKey)
	if err != nil {
		return false
	}

	h := hmac.New(sha256.New, authKey)
	h.Write([]byte(pendingNonce))
	expected := h.Sum(nil)

	provided, err := hex.DecodeString(proof)
	if err != nil {
		return false
	}

	return hmac.Equal(expected, provided)
}

func (s *RoomsService) DeletePendingChallenge(room Room, connId string) {
	delete(room.pendingChallenges, connId)
}

func (s *RoomsService) AddConnection(room Room, connId string, conn *websocket.Conn) {
	s.mu.Lock()
	defer s.mu.Unlock()

	room.connections[connId] = conn
}

func (s *RoomsService) RemoveConnection(room Room, connId string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(room.connections, connId)
}

func (s *RoomsService) GetConnections(room Room) map[string]*websocket.Conn {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return room.connections
}
