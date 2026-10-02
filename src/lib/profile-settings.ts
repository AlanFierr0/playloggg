import { profileNames } from "./steam-openid.ts";

export function profileSettings(form: FormData) {
  if (form.get("setting") === "names") {
    const names = profileNames({ handle: form.get("handle"), displayName: form.get("displayName") });
    return names ? { setting: "names" as const, values: names } : null;
  }
  if (form.get("setting") === "identity") {
    const fields = [["bio", 500], ["location", 80], ["platformPreference", 80]] as const;
    const values: Record<string, string | null> = {};
    for (const [key, limit] of fields) {
      const value = form.get(key);
      if (typeof value !== "string" || value.length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) return null;
      values[key === "platformPreference" ? "platform_preference" : key] = value.trim() || null;
    }
    return { setting: "identity" as const, values };
  }
  if (form.get("setting") === "visibility") {
    const value = form.get("visibility");
    return value === "public" || value === "private" ? { setting: "visibility" as const, values: value === "public" ? {is_public:true} : {is_public:false,is_discoverable:false} } : null;
  }
  if (form.get("setting") === "discovery") {
    const value=form.get("discovery");
    return value==="on" || value==="off" ? {setting:"discovery" as const,values:{is_discoverable:value==="on"}} : null;
  }
  return null;
}

export function publicProfilePath(handle: string) {
  return /^[a-z0-9][a-z0-9_]{2,29}$/.test(handle) ? `/u/${handle}` : null;
}
