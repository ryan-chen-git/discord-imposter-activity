// game logic handled here

export const gameStates = {
  gameLobby: "lobby",
  gameMenu: "menu",
  inProgress: "in progress",
  endScreen: "end screen",
};

let currentGameState = gameStates.gameMenu; // default game state

export function handleGameStateUpdates() {
  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("lobby-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";

  switch (currentGameState) {
    case gameLobby:
      console.log("Waiting in lobby...");
      break;
    case gameMenu:
      console.log("Opening menu...");
      break;
    case inProgress:
      console.log("Game in progress...");
      break;
    case endScreen:
      console.log("Game ending...");
      break;
  }
}

export function getCurrentGameState() {
  return currentGameState;
}

export function setCurrentGameState(state) {
  if (currentGameState !== state) {
    currentGameState = state;
  }
}
