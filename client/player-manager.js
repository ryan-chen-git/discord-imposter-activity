// manages the players playing the activity

import { discordSdk } from "./auth";
import {
  gameStates,
  getCurrentGameState,
  setCurrentGameState,
} from "./game-logic";

export function subscribeToPlayerUpdates() {
  discordSdk.subscribe(
    "ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE",
    ({ participants }) => {
      console.log("Updated participants:", participants);
      if (participants.length >= 3) {
        // there are enough players
        setCurrentGameState(gameStates.inProgress);
      } else if (getCurrentGameState() === gameStates.inProgress) {
        // there are less than 3 players
        setCurrentGameState(gameStates.endScreen);
      }
    }
  );
}
