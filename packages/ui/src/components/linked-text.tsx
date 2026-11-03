import { Fragment } from "react";

const LINK = /(https:\/\/[^\s)]+[^\s).,;:]|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

/** Texte brut dont les URL https et les adresses e-mail deviennent des liens. */
export function LinkedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(LINK);
  return (
    <>
      {parts.map((part, i) => {
        // split() avec un groupe capturant : les indices impairs sont les liens.
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        const isMail = !part.startsWith("https://");
        return (
          <a
            key={i}
            href={isMail ? `mailto:${part}` : part}
            className={className}
            {...(isMail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
