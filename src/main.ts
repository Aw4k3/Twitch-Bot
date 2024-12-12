import "dotenv/config";
import WebSocket from "ws";
import startCLI from "./CLI";
import { handleWebSocketMessage, eventSubWsUrl } from "./api/chat";
import { getOAuthToken, setOAuthToken, startDatabase } from "./api/database";
import generateOAuth from "./helpers/Generate-OAuth";
import { log, logDebug, logError } from "./helpers/Utilities";

async function init(): Promise<void> {
  /* Get Auth */
  let authAttempts = 1;

  while (authAttempts > 0) {
    authAttempts--;
    const response = await fetch("https://id.twitch.tv/oauth2/validate", {
      method: "GET",
      headers: {
        Authorization: "OAuth " + getOAuthToken(),
      },
    });
  
    if (response.status !== 200) {
      let data = await response.json();
      logError(
        `Token is not valid. /oauth2/validate returned status code ${response.status}`
      );
      console.error(data);
      setOAuthToken((await generateOAuth()).accessToken);
    } else {
      log("Validated token.");
      break;
    }
  }

  /* Start Websocket */
  const websocketClient = new WebSocket(eventSubWsUrl);

  websocketClient.on("error", console.error);

  websocketClient.on("open", () => {
    log("WebSocket connection opened to " + eventSubWsUrl);
  });

  websocketClient.on("message", (data) => {
    handleWebSocketMessage(JSON.parse(data.toString()));
  });
}

startCLI();
startDatabase();
// init();

logDebug(getOAuthToken());

log("Bot ready");
