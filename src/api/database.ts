import { Database } from "sqlite3";
import { log, logDebug, logError, logWarning } from "../helpers/Utilities";

const db = new Database("../database.db");

export function startDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
    option VARCHAR(32) NOT NULL,
    value TEXT
    );
  `);

  log("Database ready");
}

export function getOAuthToken(): string {
  let token: string = "";

  db.get(
    `SELECT value FROM config WHERE option = 'OAuthToken'`,
    [],
    (err, row: { value: string }) => {
      if (err) {
        logError(err.message);
      } else {
        if (row) token = row.value;
        else log("Token not found");
      }
    }
  );

  return token;
}

export function setOAuthToken(token: string): void {
  const query = db.prepare(
    `INSERT OR REPLACE INTO config (option, value) VALUES ('OAuthToken', ?);`
  );
  query.run(token);
}
