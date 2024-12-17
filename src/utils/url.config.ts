import { url } from "inspector";

export const BASE_ASSETS_URL =
  process.env.NEXT_PUBLIC_MEDIA_ASSET_URL ||
  "http://localhost:3000/storage/v1/object";
export const baseUrl = (partial: string) => `${BASE_ASSETS_URL}${partial}`;

export const removeBaseUrl = (url: string) =>
  url.replace(BASE_ASSETS_URL, "").trim();
