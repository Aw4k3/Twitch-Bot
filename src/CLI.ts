import readline from "node:readline";
import generateOAuth from "./helpers/Generate-OAuth";

export default function startCLI(): void {
  const stdin = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  stdin.on("line", onInput);

  function onInput(input: string): void {
    if (input.toLowerCase() === "generate-oauth") generateOAuth();
  }
}
