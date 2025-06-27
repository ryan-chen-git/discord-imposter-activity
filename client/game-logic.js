// game logic handled here

export const gameStates = {
  gameLobby: "lobby",
  gameMenu: "menu",
  inProgress: "in progress",
  endScreen: "end screen",
};

let currentGameState = gameStates.gameMenu; // default game state

export function handleGameStateUpdates() {
  document.getElementById("lobby-screen").style.display = "none";
  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("end-screen").style.display = "none";

  switch (currentGameState) {
    case gameLobby:
      document.getElementById("lobby-screen").style.display = "block";
      console.log("Waiting in lobby...");
      break;
    case gameMenu:
      document.getElementById("menu-screen").style.display = "block";
      console.log("Opening menu...");
      break;
    case inProgress:
      document.getElementById("game-screen").style.display = "block";
      console.log("Game in progress...");
      break;
    case endScreen:
      document.getElementById("end-screen").style.display = "block";
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
