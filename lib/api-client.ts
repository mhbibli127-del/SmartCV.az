type ApiOptions = RequestInit & {
  json?: unknown;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<{ ok: boolean; status: number; data: T }> {
  const { json, headers, ...rest } = options;

  try {
    const response = await fetch(path, {
      ...rest,
      credentials: "include",
      headers: {
        ...(json ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });

    let data: T;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = (await response.json()) as T;
      } catch {
        data = {} as T;
      }
    } else {
      data = (await response.blob()) as T;
    }

    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    console.error("[api-client]", path, err);
    return { ok: false, status: 0, data: {} as T };
  }
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, json?: unknown) =>
    apiFetch<T>(path, { method: "POST", json }),
  put: <T>(path: string, json?: unknown) =>
    apiFetch<T>(path, { method: "PUT", json }),
  patch: <T>(path: string, json?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", json }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
