const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:5086";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? response.statusText;
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return (await response.json()) as T;
}

export async function apiSend<T>(
  path: string,
  method: string,
  body?: unknown,
): Promise<T | null> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : null;
}

export async function apiUpload<T>(
  path: string,
  form: FormData,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
  return (await response.json()) as T;
}

export function mediaUrl(relativePath: string): string {
  return `${API_BASE}/api/media?path=${encodeURIComponent(relativePath)}`;
}

export { API_BASE };
