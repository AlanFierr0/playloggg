export function ReviewText({ text }: { text: string }) {
  return <p translate="no" className="whitespace-pre-wrap break-words text-on-surface-variant">{text.split(/(https?:\/\/[^\s<>]+)/g).map((part, index) => /^https?:\/\//.test(part) ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:no-underline">{part}</a> : part)}</p>;
}
