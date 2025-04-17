export const extractNumericId = (
  prefixedId: string | number,
  prefix: string
): number | null => {
  if (typeof prefixedId === "number") return prefixedId;

  if (typeof prefixedId === "string" && prefixedId.startsWith(prefix)) {
    const idStr = prefixedId.replace(prefix, "");
    const id = parseInt(idStr);
    return isNaN(id) ? null : id;
  }

  // Try to parse the provided ID as a fallback
  const fallbackId = parseInt(String(prefixedId));
  return isNaN(fallbackId) ? null : fallbackId;
};
