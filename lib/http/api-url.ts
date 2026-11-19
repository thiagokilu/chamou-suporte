const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
  /\/+$/,
  "",
);

export function apiOrigin(): string {
  if (!configuredApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }

  return new URL(configuredApiUrl).origin;
}

export function apiUrl(path: string): string {
  if (!configuredApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }

  return `${configuredApiUrl}/${path.replace(/^\/+/, "")}`;
}
