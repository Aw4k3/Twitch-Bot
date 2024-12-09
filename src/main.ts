import "dotenv/config";
import WebSocket from "ws";
import initCli from "./CLI";
import { oAuthToken, handleWebSocketMessage, eventSubWsUrl } from "./api/chat";

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



initCli();
init();

console.log("Ready");
