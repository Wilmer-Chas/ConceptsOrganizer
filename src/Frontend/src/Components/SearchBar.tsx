"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { knowledgeApi } from "@/Api/knowledgeApi";
import type { SearchHitDto } from "@/Api/types";
import styles from "./SearchBar.module.css";

const SEARCH_SESSION_KEY = "concepts-search-q";

function buildHref(hit: SearchHitDto, q: string): string {
  const phrase = q.trim();
  const qParam = phrase ? `&q=${encodeURIComponent(phrase)}` : "";
  if (hit.kind === "folder") {
    return `/?path=${encodeURIComponent(hit.path)}${qParam}`;
  }
  return `/note?path=${encodeURIComponent(hit.path)}${qParam}`;
}

function SearchBarInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQ = searchParams.get("q") ?? "";
  const currentPath = searchParams.get("path") ?? "";

  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return urlQ;
    return urlQ || sessionStorage.getItem(SEARCH_SESSION_KEY) || "";
  });
  const [hits, setHits] = useState<SearchHitDto[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!urlQ) return;
    setQuery((prev) => (prev === urlQ ? prev : urlQ));
    sessionStorage.setItem(SEARCH_SESSION_KEY, urlQ);
  }, [urlQ]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed === urlQ) return;

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        params.set("q", trimmed);
        sessionStorage.setItem(SEARCH_SESSION_KEY, trimmed);
      } else {
        params.delete("q");
        sessionStorage.removeItem(SEARCH_SESSION_KEY);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 280);

    return () => window.clearTimeout(handle);
  }, [query, urlQ, pathname, router, searchParams]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setHits([]);
      setOpen(false);
      return;
    }

    const handle = window.setTimeout(() => {
      void knowledgeApi
        .search(trimmed)
        .then((results) => {
          setHits(results);
          const currentIdx = results.findIndex((hit) => hit.path === currentPath);
          setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
          if (document.activeElement === inputRef.current) {
            setOpen(true);
          }
        })
        .catch(() => setHits([]));
    }, 180);

    return () => window.clearTimeout(handle);
  }, [query, currentPath]);

  const noteHits = useMemo(
    () => hits.filter((hit) => hit.kind === "note"),
    [hits],
  );

  const noteIndex = useMemo(() => {
    if (!currentPath) return -1;
    return noteHits.findIndex((hit) => hit.path === currentPath);
  }, [noteHits, currentPath]);

  const go = useCallback(
    (hit: SearchHitDto) => {
      setOpen(false);
      router.push(buildHref(hit, query));
    },
    [query, router],
  );

  const hopNotes = useCallback(
    (delta: number) => {
      if (noteHits.length === 0) return;
      const base = noteIndex >= 0 ? noteIndex : delta > 0 ? -1 : 0;
      const next = (base + delta + noteHits.length * 10) % noteHits.length;
      go(noteHits[next]);
    },
    [go, noteHits, noteIndex],
  );

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!query.trim() || noteHits.length === 0) return;
      if (!event.altKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();
      hopNotes(event.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hopNotes, noteHits.length, query]);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!hits.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % hits.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index - 1 + hits.length) % hits.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[activeIndex] ?? hits[0];
      if (hit) go(hit);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const hopLabel =
    noteHits.length === 0
      ? null
      : `${noteIndex >= 0 ? noteIndex + 1 : "—"} / ${noteHits.length}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <input
          ref={inputRef}
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => hits.length > 0 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onInputKeyDown}
          placeholder="Search exact phrase…"
          aria-label="Search exact phrase"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {noteHits.length > 0 ? (
          <div className={styles.hop} aria-label="Search hit navigation">
            <button
              type="button"
              className={styles.hopButton}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => hopNotes(-1)}
              title="Previous match (Alt+←)"
              aria-label="Previous matching note"
            >
              ‹
            </button>
            <span className={styles.hopCount}>{hopLabel}</span>
            <button
              type="button"
              className={styles.hopButton}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => hopNotes(1)}
              title="Next match (Alt+→)"
              aria-label="Next matching note"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
      {open && hits.length > 0 ? (
        <ul className={styles.results} role="listbox">
          {hits.map((hit, index) => {
            const isCurrent = hit.path === currentPath && currentPath.length > 0;
            const isActive = index === activeIndex;
            return (
              <li key={hit.path} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  className={`${styles.result}${isActive ? ` ${styles.resultActive}` : ""}${isCurrent ? ` ${styles.resultCurrent}` : ""}`}
                  onMouseDown={() => go(hit)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={styles.resultName}>
                    {hit.kind === "folder" ? "Folder" : "Note"} · {hit.name}
                    {isCurrent ? " · open" : ""}
                  </span>
                  <span className={styles.resultMeta}>
                    {hit.parentPath || "Knowledge"}
                    {hit.snippet ? ` — ${hit.snippet}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function SearchBarFallback() {
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <input
          className={styles.input}
          disabled
          placeholder="Search exact phrase…"
          aria-label="Search exact phrase"
        />
      </div>
    </div>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={<SearchBarFallback />}>
      <SearchBarInner />
    </Suspense>
  );
}
