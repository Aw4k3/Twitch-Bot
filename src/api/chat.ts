import { getOAuthToken } from "./database";

const botUserId: string = "";
let oAuthToken: string = "";
const clientId: string = "kzbcmztcozjdk6m6t0aybzr5mjqq85";
const channels: string[] = ["Awake_Live"];
export const eventSubWsUrl = "wss://eventsub.wss.twitch.tv/ws";

let websocketSessionID: any = undefined;

export async function handleWebSocketMessage(data: any) {
  oAuthToken = await getOAuthToken();
  
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

export async function sendChatMessage(message: string) {
  let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + oAuthToken,
      "Client-Id": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      broadcaster_id: channels[0],
      sender_id: botUserId,
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

export async function registerEventSubListeners() {
  // Register channel.chat.message
  let response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + oAuthToken,
        "Client-Id": clientId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: channels[0],
          user_id: botUserId,
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