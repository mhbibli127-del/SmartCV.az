/** Returns true when the URL needs crossOrigin for canvas/html2canvas export. */
export function needsCrossOrigin(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return false;
  if (src.startsWith("/")) return false;
  try {
    const url = new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    return url.origin !== (typeof window !== "undefined" ? window.location.origin : "");
  } catch {
    return false;
  }
}

function loadImageElement(src: string, useCors: boolean): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (useCors) img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Preload a single image (CORS-safe when possible). Falls back to local portrait asset. */
export function preloadImage(
  src: string,
  fallbackSrc = "/samples/default-portrait.svg"
): Promise<HTMLImageElement | null> {
  if (typeof window === "undefined" || !src.trim()) return Promise.resolve(null);

  const tryLoad = async (url: string, allowRetryWithoutCors: boolean): Promise<HTMLImageElement | null> => {
    const useCors = needsCrossOrigin(url);
    const loaded = await loadImageElement(url, useCors);
    if (loaded) return loaded;

    if (useCors && allowRetryWithoutCors) {
      return loadImageElement(url, false);
    }

    return null;
  };

  return (async () => {
    const primary = await tryLoad(src, true);
    if (primary) return primary;

    if (fallbackSrc && fallbackSrc !== src) {
      return tryLoad(fallbackSrc, false);
    }

    return null;
  })();
}

export async function preloadImages(sources: string[]): Promise<void> {
  const unique = [...new Set(sources.filter(Boolean))];
  await Promise.all(unique.map((src) => preloadImage(src)));
}

/** Wait until DOM <img> nodes under root are decoded, then settle. */
export async function waitForImages(
  root: ParentNode = typeof document !== "undefined" ? document.body : (null as unknown as ParentNode),
  settleMs = 500
): Promise<void> {
  if (typeof window === "undefined" || !root) return;

  const images = root.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );

  if (settleMs > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, settleMs));
  }
}
