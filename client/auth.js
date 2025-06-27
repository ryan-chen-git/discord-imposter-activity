import { DiscordSDK } from "@discord/embedded-app-sdk";

// Will eventually store the authenticated user's access_token
let auth;

export const discordSdk = new DiscordSDK(
  import.meta.env.VITE_DISCORD_CLIENT_ID
);

export async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log(`[${new Date().toISOString()}] Discord SDK is ready`);

  // Authorize with Discord Client
  let authorization_code;
  try {
    const result = await discordSdk.commands.authorize({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify", "guilds", "applications.commands"],
    });
    authorization_code = result.code;
    console.log("Authorization code received: " + authorization_code);
  } catch (err) {
    console.log("authorize() failed: " + err.message);
  }

  // Retrieve an access_token from your activity's server
  // Note: We need to prefix our backend `/api/token` route with `/.proxy` to stay compliant with the CSP.
  // Read more about constructing a full URL and using external resources at
  // https://discord.com/developers/docs/activities/development-guides/networking#construct-a-full-url
  const response = await fetch("/.proxy/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: authorization_code,
    }),
  });
  const { access_token } = await response.json();
  console.log("Access token returned to frontend");

  try {
    // Authenticate with Discord client (using the access_token)
    auth = await discordSdk.commands.authenticate({
      access_token,
    });
    console.log("Access token authentication successful");

    // We can now make API calls within the scopes we requested in setupDiscordSDK()
    // Note: the access_token returned is a sensitive secret and should be treated as such
    console.log("Discord SDK setup successful");
  } catch (err) {
    console.log(`Access token authentication failed: ${err.message}`);
  }
}
