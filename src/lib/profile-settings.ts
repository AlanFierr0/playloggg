import { profileNames } from "./steam-openid.ts";

export function profileSettings(form: FormData) {
  if (form.get("setting") === "names") {
    const names = profileNames({ handle: form.get("handle"), displayName: form.get("displayName") });
    return names ? { setting: "names" as const, values: names } : null;
  }
  if (form.get("setting") === "visibility") {
    const value = form.get("visibility");
    return value === "public" || value === "private" ? { setting: "visibility" as const, values: { is_public: value === "public" } } : null;
  }
  return null;
}

export function publicProfilePath(handle: string) {
  return /^[a-z0-9][a-z0-9_]{2,29}$/.test(handle) ? `/u/${handle}` : null;
}
