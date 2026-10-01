"use client";
import { useMessages } from "@/components/site-preferences";


import { createContext, useContext, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

const NoticeContext = createContext<(message: string) => void>(() => {});

export function PreviewNoticeProvider({ children }: { children: ReactNode }) {
  const t = useMessages();
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 6000);
    return () => window.clearTimeout(timeout);
  }, [message]);
  return (
    <NoticeContext.Provider value={setMessage}>
      {children}
      {message && (
        <div role="status" className="fixed bottom-5 left-5 right-5 z-[100] mx-auto flex max-w-xl items-start gap-3 rounded-lg bg-surface-container-high px-5 py-4 text-body-md text-on-surface shadow-2xl ring-1 ring-outline-variant">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">info</span>
          <span className="min-w-0 flex-1 break-words">{t(message)}</span>
          <button type="button" aria-label={t("Dismiss notice")} onClick={() => setMessage("")} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
      )}
    </NoticeContext.Provider>
  );
}

export function useNotice() { return useContext(NoticeContext); }

// Sample controls stay visible, but cannot imply a real action.
export function PreviewAction({ message, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  const t = useMessages();
  return <button {...props} type="button" disabled title={t(message)} className={`${props.className ?? ""} cursor-not-allowed opacity-60`}>
    {children}<span className="ml-1 text-[10px] normal-case tracking-normal">{t("Unavailable")}</span>
  </button>;
}
