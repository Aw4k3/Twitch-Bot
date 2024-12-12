export function generateTimestamp(): string {
  return new Date().toLocaleString().replace(",", "");
}

export function log(message: string): void {
  console.log(`\x1b[0m[${generateTimestamp()}] ${message}\x1b[0m`);

  // Implement API related functionality here.
}

export function logWarning(message: string): void {
  console.log(`\x1b[33m[${generateTimestamp()}] ${message}\x1b[0m`);

  // Implement API related functionality here.
}

export function logError(message: string): void {
  console.error(`\x1b[31m[${generateTimestamp()}] ${message}\x1b[0m`);

  // Implement API related functionality here.
}

export function logDebug(message: string): void {
  console.log(`\x1b[36m[${generateTimestamp()}] ${message}\x1b[0m`);

  // Implement API related functionality here.
}