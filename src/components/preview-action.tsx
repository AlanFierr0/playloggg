"use client";

import { createContext, useContext, useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

const NoticeContext = createContext<(message: string) => void>(() => {});

export function PreviewNoticeProvider({ children }: { children: ReactNode }) {
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
          <span className="flex-1">{message}</span>
          <button type="button" aria-label="Dismiss notice" onClick={() => setMessage("")} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
      )}
    </NoticeContext.Provider>
  );
}

export function PreviewAction({ message, children, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  const notify = useContext(NoticeContext);
  return <button {...props} type={props.type ?? "button"} onClick={(event) => { onClick?.(event); notify(message); }}>{children}</button>;
}
