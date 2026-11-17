"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { knowledgeApi } from "@/Api/knowledgeApi";
import type { SearchHitDto } from "@/Api/types";
import styles from "./SearchBar.module.css";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHitDto[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setHits([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void knowledgeApi
        .search(query.trim())
        .then((results) => {
          setHits(results);
          setOpen(true);
        })
        .catch(() => setHits([]));
    }, 180);

    return () => window.clearTimeout(handle);
  }, [query]);

  const go = (hit: SearchHitDto) => {
    setOpen(false);
    setQuery("");
    if (hit.kind === "folder") {
      router.push(`/?path=${encodeURIComponent(hit.path)}`);
      return;
    }
    router.push(`/note?path=${encodeURIComponent(hit.path)}`);
  };

  return (
    <div className={styles.wrap}>
      <input
        className={styles.input}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => hits.length > 0 && setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="Search concepts…"
        aria-label="Search concepts"
      />
      {open && hits.length > 0 ? (
        <ul className={styles.results}>
          {hits.map((hit) => (
            <li key={hit.path}>
              <button type="button" className={styles.result} onMouseDown={() => go(hit)}>
                <span className={styles.resultName}>
                  {hit.kind === "folder" ? "Folder" : "Note"} · {hit.name}
                </span>
                <span className={styles.resultMeta}>
                  {hit.parentPath || "Knowledge"}
                  {hit.snippet ? ` — ${hit.snippet}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
