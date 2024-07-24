// utils.ts
import pako from "pako";

export const parseCompressed = (data: string): any => {
  const uint8Array = new Uint8Array(
    atob(data)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
  const inflatedData = pako.inflateRaw(uint8Array, { to: "string" });
  return JSON.parse(inflatedData);
};

export const deepObjectMerge = (original: any = {}, modifier: any): any => {
  if (!modifier) return original;
  const copy = { ...original };
  for (const [key, value] of Object.entries(modifier)) {
    const valueIsObject =
      typeof value === "object" && !Array.isArray(value) && value !== null;
    if (valueIsObject && !!Object.keys(value).length) {
      copy[key] = deepObjectMerge(copy[key], value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
};
