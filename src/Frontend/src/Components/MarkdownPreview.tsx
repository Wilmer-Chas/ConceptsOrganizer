"use client";

import ReactMarkdown from "react-markdown";
import { knowledgeApi } from "@/Api/knowledgeApi";
import { linkifyConceptTags } from "@/Components/conceptTags";
import styles from "./MarkdownPreview.module.css";

interface MarkdownPreviewProps {
  content: string;
  folderPath: string;
  onConceptClick?: (name: string) => void;
}

export function MarkdownPreview({
  content,
  folderPath,
  onConceptClick,
}: MarkdownPreviewProps) {
  const linked = linkifyConceptTags(content);

  return (
    <div className={styles.preview}>
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => {
            const raw = typeof src === "string" ? src : undefined;
            const resolved = raw
              ? knowledgeApi.resolveMediaUrl(folderPath, raw)
              : undefined;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolved} alt={alt ?? ""} className={styles.image} />
            );
          },
          a: ({ href, children }) => {
            if (href?.startsWith("concept://")) {
              const name = decodeURIComponent(href.slice("concept://".length));
              return (
                <button
                  type="button"
                  className={styles.concept}
                  onClick={() => onConceptClick?.(name)}
                >
                  {children}
                </button>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {linked}
      </ReactMarkdown>
    </div>
  );
}
