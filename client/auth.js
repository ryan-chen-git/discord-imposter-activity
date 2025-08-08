import { DiscordSDK, DiscordSDKMock } from "@discord/embedded-app-sdk";

// Will eventually store the authenticated user's access_token
let auth;

const queryParams = new URLSearchParams(window.location.search);
const isEmbedded = queryParams.get("frame_id") != null;

// Debug environment variable loading
console.log('Environment check:');
console.log('VITE_DISCORD_CLIENT_ID:', import.meta.env.VITE_DISCORD_CLIENT_ID);
console.log('isEmbedded:', isEmbedded);
console.log('frame_id:', queryParams.get("frame_id"));

let discordSdk;

// Get client ID with fallback
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || '1234567890123456789'; // Fallback client ID

if (isEmbedded) {
  discordSdk = new DiscordSDK(clientId);
} else {
  // Use mock SDK for development/testing
  const mockUserId = Math.random().toString(36).slice(2, 10);
  const mockGuildId = Math.random().toString(36).slice(2, 10);
  const mockChannelId = Math.random().toString(36).slice(2, 10);
  
  discordSdk = new DiscordSDKMock(
    clientId,
    mockGuildId,
    mockChannelId
  );
  
  const discriminator = String(mockUserId.charCodeAt(0) % 5);
  
  discordSdk._updateCommandMocks({
    authenticate: async () => {
      return await {
        access_token: "mock_token",
        user: {
          username: mockUserId,
          discriminator,
          id: mockUserId,
          avatar: null,
          public_flags: 1,
        },
        scopes: [],
        expires: new Date(2112, 1, 1).toString(),
        application: {
          description: "mock_app_description",
          icon: "mock_app_icon",
          id: "mock_app_id",
          name: "mock_app_name",
        },
      };
    },
    getInstanceConnectedParticipants: async () => {
      return {
        participants: [
          { user: { username: 'Alice', id: '1' } },
          { user: { username: 'Bob', id: '2' } },
          { user: { username: 'Charlie', id: '3' } }
        ]
      };
    }
  });
}

export { discordSdk };

export async function setupDiscordSdk() {
  await discordSdk.ready();
  console.log(`[${new Date().toISOString()}] Discord SDK is ready`);

  // Authorize with Discord Client
  let authorization_code;
  try {
    const result = await discordSdk.commands.authorize({
      client_id: clientId,
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
