import { setupDiscordSdk, discordSdk } from "./auth.js";
import "./style.css";

async function main() {
  await setupDiscordSdk();
  console.log("getting user data...");
  const { participants } =
    await discordSdk.commands.getInstanceConnectedParticipants();
  const host = participants[0];
  console.log("Participants:", participants);
  console.log("Host:", host);
}

main();
