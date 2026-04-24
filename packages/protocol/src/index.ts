// Server -> Client messages

export interface ConnectionsMessage {
  type: 'connections';
  count: number;
}

export interface ChallengeMessage {
  type: 'challenge';
  nonce: string;
}

export interface AuthenticatedMessage {
  type: 'authenticated';
}

export interface ErrorMessage {
  type: 'error';
  message: 'room_not_found' | 'expected_challenge_response' | 'auth_failed';
}

export interface IncomingChatMessage {
  type: 'message';
  name: string;
  text: string;
  ts: number;
}

export type ServerMessage =
  | ChallengeMessage
  | AuthenticatedMessage
  | ErrorMessage
  | IncomingChatMessage
  | ConnectionsMessage;

// Client -> Server messages

export interface ChallengeResponseMessage {
  type: 'challenge_response';
  proof: string;
}

export interface OutgoingChatMessage {
  type: 'message';
  name: string;
  text: string;
}

export type ClientMessage =
  | ChallengeResponseMessage
  | OutgoingChatMessage;
