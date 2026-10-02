"use client";
import { useState } from "react";
import { useMessages } from "@/components/site-preferences";
import type { ShareCard } from "@/lib/share-card";
export function ShareCardControls({ endpoint }: { endpoint: string }) {
  const t = useMessages(),
    [size, setSize] = useState("square"),
    [pending, setPending] = useState(false),
    [message, setMessage] = useState("");
  async function download() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error();
      const card: ShareCard = await response.json();
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      [canvas.width, canvas.height] =
        size === "story"
          ? [1080, 1920]
          : size === "landscape"
            ? [1920, 1080]
            : [1080, 1080];
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#101114";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const margin = canvas.width * 0.07;
      ctx.fillStyle = "#ffc665";
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("PLAYLOGG.GG", margin, margin);
      ctx.fillStyle = "#e3e2e6";
      ctx.font = 'bold 54px "Space Grotesk", sans-serif';
      ctx.fillText(card.title, margin, margin + 85, canvas.width - margin * 2);
      ctx.fillStyle = "#d4c4b0";
      ctx.font = "32px sans-serif";
      ctx.fillText(
        t(card.subtitle),
        margin,
        margin + 140,
        canvas.width - margin * 2,
      );
      const max = size === "story" ? 10 : 6,
        items = card.items.slice(0, max),
        top = margin + 200,
        rowHeight = Math.min(
          150,
          (canvas.height - top - margin) / Math.max(items.length, 1),
        );
      const images = await Promise.all(
        items.map((item) =>
          item.cover
            ? new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                const timeout = setTimeout(() => resolve(null), 5000);
                img.onload = () => {
                  clearTimeout(timeout);
                  resolve(img);
                };
                img.onerror = () => {
                  clearTimeout(timeout);
                  resolve(null);
                };
                img.src = item.cover!;
              })
            : Promise.resolve(null),
        ),
      );
      for (let i = 0; i < items.length; i++) {
        const item = items[i],
          y = top + i * rowHeight;
        const image = images[i];
        ctx.fillStyle = "#1b1b1f";
        ctx.fillRect(margin, y, canvas.width - margin * 2, rowHeight - 10);
        if (image)
          ctx.drawImage(
            image,
            margin + 10,
            y + 5,
            ((rowHeight - 20) * 2) / 3,
            rowHeight - 20,
          );
        const textX = margin + (image ? rowHeight * 0.8 : 24);
        ctx.fillStyle = "#e3e2e6";
        ctx.font = "28px sans-serif";
        ctx.fillText(
          item.translateLabel ? t(item.label) : item.label,
          textX,
          y + rowHeight * 0.4,
          canvas.width - textX - margin - 24,
        );
        ctx.fillStyle = "#ffc665";
        ctx.font = "bold 30px sans-serif";
        ctx.fillText(
          t(item.value),
          textX,
          y + rowHeight * 0.75,
          canvas.width - textX - margin - 24,
        );
      }
      if (!items.length) {
        ctx.fillStyle = "#d4c4b0";
        ctx.font = "30px sans-serif";
        ctx.fillText(t("No entries yet."), margin, top);
      }
      ctx.fillStyle = "#d4c4b0";
      ctx.font = "22px sans-serif";
      if (card.items.length > items.length)
        ctx.fillText(
          `${items.length} / ${card.items.length}`,
          margin,
          canvas.height - 25,
        );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = `playlogg-${size}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Share card downloaded.");
    } catch {
      setMessage("This share card is unavailable. Please retry.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-2">
          <span className="block">{t("Share card format")}</span>
          <select
            aria-label={t("Share card format")}
            className="rounded bg-surface-container p-3"
            disabled={pending}
            value={size}
            onChange={(event) => setSize(event.target.value)}
          >
            <option value="square">1:1</option>
            <option value="story">9:16</option>
            <option value="landscape">16:9</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded bg-primary px-5 py-3 text-on-primary disabled:opacity-50"
          disabled={pending}
          onClick={download}
        >
          {t(pending ? "Preparing…" : "Download share card")}
        </button>
      </div>
      <p role="status" className="text-body-sm text-on-surface-variant">
        {t(message)}
      </p>
    </div>
  );
}
