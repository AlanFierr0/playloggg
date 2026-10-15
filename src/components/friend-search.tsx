"use client";

import Form from "next/form";
import { useEffect, useRef } from "react";
import { useMessages } from "@/components/site-preferences";

export function FriendSearch({ query }: { query: string }) {
  const t = useMessages();
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function cancel() { if (timer.current) clearTimeout(timer.current); timer.current = null; }
  function search() { cancel(); timer.current = setTimeout(() => form.current?.requestSubmit(), 250); }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (input.current && document.activeElement !== input.current) input.current.value = query;
  }, [query]);

  return <Form ref={form} action="/people" replace scroll={false} onSubmit={cancel} className="flex flex-col sm:flex-row gap-3 items-end">
    <label className="w-full min-w-0 space-y-2"><span className="block">{t("Find profiles")}</span><input ref={input} name="q" defaultValue={query} maxLength={80} placeholder={t("Search by name or handle")} className="catalog-control" onChange={event => { if (!(event.nativeEvent as InputEvent).isComposing) search(); }} onCompositionStart={cancel} onCompositionEnd={search} /></label>
    <button className="shrink-0 rounded bg-primary-container text-on-primary-container px-5 py-3">{t("Search")}</button>
    {query && <button type="button" onClick={() => { cancel(); if (input.current) { input.current.value = ""; input.current.focus(); } form.current?.requestSubmit(); }} className="shrink-0 text-primary px-4 py-3">{t("Clear search")}</button>}
  </Form>;
}
