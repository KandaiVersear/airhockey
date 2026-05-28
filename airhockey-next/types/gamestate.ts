export type GameUpdateState = {
  PuckX: number;
  PuckY: number;
  Player1X: number;
  Player1Y: number;
  Player2X: number;
  Player2Y: number;
  Score1: number;
  Score2: number;
  TimeLeftSec: number;
};

export type GameState = {
  gameSession: GameUpdateState;
  PuddleRadius: number;
  PuckRadius: number;
};
