import { initiateDiscordSDK, discordSdk } from './utils/discordSdk.js';
import "./style.css";

import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';


//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.80.0/Phaser.Types.Core.GameConfig
(async () => {
  await initiateDiscordSDK();
  // You can use discordSdk to access the Discord SDK and make the requests you need

  
  const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: 'game-container',
      backgroundColor: '#028af8',
      scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver
      ]
  };

  new Phaser.Game(config);
})();

// import "./style.css";
// console.log("getting user data...");
// const { participants } =
//   await discordSdk.commands.getInstanceConnectedParticipants();
// const host = participants[0];
// console.log("Participants:", participants);
// console.log("Host:", host);
// subscribeToPlayerUpdates();
