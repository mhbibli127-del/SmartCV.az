const HEX6 = /^#[0-9a-fA-F]{6}$/;
const HEX3 = /^#[0-9a-fA-F]{3}$/;

function channelToHex(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, "0");
}

function expandHex3(hex: string): string {
  const r = hex[1]!;
  const g = hex[2]!;
  const b = hex[3]!;
  return `#${r}${r}${g}${g}${b}${b}`;
}

/**
 * Normalize any CSS color to #rrggbb for <input type="color">.
 * RGBA values are composited on white (alpha is not editable via native picker).
 */
export function toHexColorForInput(
  color: string | undefined | null,
  fallback = "#18181b"
): string {
  if (!color?.trim()) return fallback;

  const value = color.trim();

  if (HEX6.test(value)) return value.toLowerCase();
  if (HEX3.test(value)) return expandHex3(value).toLowerCase();

  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const a = rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1;
    const alpha = Number.isFinite(a) ? Math.max(0, Math.min(1, a)) : 1;
    const br = r * alpha + 255 * (1 - alpha);
    const bg = g * alpha + 255 * (1 - alpha);
    const bb = b * alpha + 255 * (1 - alpha);
    return `#${channelToHex(br)}${channelToHex(bg)}${channelToHex(bb)}`;
  }

  return fallback;
}

/** True when the color cannot be represented exactly by a hex-only picker. */
export function colorHasAlpha(color: string | undefined | null): boolean {
  if (!color?.trim()) return false;
  const match = color.trim().match(/^rgba\([^)]+\)$/i);
  if (!match) return false;
  const parts = color.match(/[\d.]+/g);
  if (!parts || parts.length < 4) return false;
  const alpha = Number(parts[3]);
  return Number.isFinite(alpha) && alpha < 1;
}
