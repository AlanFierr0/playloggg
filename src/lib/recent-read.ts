// A bounded warm-instance cache. Rejected reads are never reused; expiry starts at request time.
export function recentRead<T>(load: (key: string) => Promise<T>, ttl: number, capacity: number, now = Date.now) {
  const entries = new Map<string, { expires: number; value: Promise<T> }>();
  const read = (key: string, refresh = false): Promise<T> => {
    const previous = entries.get(key);
    if (!refresh && previous && previous.expires > now()) return previous.value;
    entries.delete(key);
    for (const [id, entry] of entries) if (entry.expires <= now()) entries.delete(id);
    if (entries.size >= capacity) entries.delete(entries.keys().next().value!);
    const value = load(key);
    const entry = { expires: now() + ttl, value };
    entries.set(key, entry);
    void value.catch(() => { if (entries.get(key) === entry) entries.delete(key); });
    return value;
  };
  return Object.assign(read,{invalidate:(key:string)=>{entries.delete(key);}});
}
