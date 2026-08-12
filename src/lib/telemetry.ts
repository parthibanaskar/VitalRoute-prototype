export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  // Add any custom telemetry or error reporting here
  console.error("Captured error:", error, context);
}
