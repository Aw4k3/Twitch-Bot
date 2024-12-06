import "dotenv/config";
import WebSocket from "ws";
import initCli from "./CLI";

const botUserId: string = "";
const oAuthToken: string = "jvq83bupxv4ed6gxo19c82mka9z88y";
const clientId: string = "kzbcmztcozjdk6m6t0aybzr5mjqq85";
const channels: string[] = ["Awake_Live"];
const eventSubWsUrl = "wss://eventsub.wss.twitch.tv/ws";

async function init(): Promise<void> {
  /* Get Auth */
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    method: "GET",
    headers: {
      Authorization: "OAuth " + oAuthToken,
    },
  });

  if (response.status !== 200) {
    let data = await response.json();
    console.error(
      `Token is not valid. /oauth2/validate returned status code ${response.status}`
    );
    console.error(data);
    process.exit(1);
  }

  console.log("Validated token.");

  /* Start Websocket */
  const websocketClient = new WebSocket(eventSubWsUrl);

  websocketClient.on("error", console.error);

  websocketClient.on("open", () => {
    console.log("WebSocket connection opened to " + eventSubWsUrl);
  });

  websocketClient.on("message", (data) => {
    handleWebSocketMessage(JSON.parse(data.toString()));
  });
}

function handleWebSocketMessage(data) {
  switch (data.metadata.message_type) {
    case "session_welcome": // First message you get from the WebSocket server when connecting
      websocketSessionID = data.payload.session.id; // Register the Session ID it gives us

      // Listen to EventSub, which joins the chatroom from your bot's account
      registerEventSubListeners();
      break;
    case "notification": // An EventSub notification has occurred, such as channel.chat.message
      switch (data.metadata.subscription_type) {
        case "channel.chat.message":
          // First, print the message to the program's console.
          console.log(
            `MSG #${data.payload.event.broadcaster_user_login} <${data.payload.event.chatter_user_login}> ${data.payload.event.message.text}`
          );

          // Then check to see if that message was "HeyGuys"
          if (data.payload.event.message.text.trim() == "HeyGuys") {
            // If so, send back "VoHiYo" to the chatroom
            sendChatMessage("VoHiYo");
          }

          break;
      }
      break;
  }
}

async function sendChatMessage(message: string) {
  let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + oAuthToken,
      "Client-Id": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcaster_id: channels[0],
      sender_id: BOT_USER_ID,
      message: message,
    }),
  });

  if (response.status != 200) {
    let data = await response.json();
    console.error("Failed to send chat message");
    console.error(data);
  } else {
    console.log("Sent chat message: " + message);
  }
}

async function registerEventSubListeners() {
  // Register channel.chat.message
  let response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + OAUTH_TOKEN,
        "Client-Id": CLIENT_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: CHAT_CHANNEL_USER_ID,
          user_id: BOT_USER_ID,
        },
        transport: {
          method: "websocket",
          session_id: websocketSessionID,
        },
      }),
    }
  );

  if (response.status != 202) {
    let data = await response.json();
    console.error(
      "Failed to subscribe to channel.chat.message. API call returned status code " +
        response.status
    );
    console.error(data);
    process.exit(1);
  } else {
    const data = await response.json();
    console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
  }
}

initCli();

console.log("Ready");
