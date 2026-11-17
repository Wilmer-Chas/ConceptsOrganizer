"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { knowledgeApi } from "@/Api/knowledgeApi";
import type { SearchHitDto } from "@/Api/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
  extractConceptQuery,
  replaceRange,
} from "@/Components/conceptTags";
import { SearchBar } from "@/Components/SearchBar";
import { colorForPath } from "@/Components/tileColors";
import styles from "./NoteEditor.module.css";

interface NoteEditorProps {
  path: string;
}

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

function normalizeConcept(value: string): string {
  return value.replace(/[\s_-]+/g, "").toLowerCase();
}

function tagFromName(value: string): string {
  return `#${value.replace(/\s+/g, "")}`;
}

function extractLinkedTags(content: string): string[] {
  const tags = new Set<string>();
  const parts = content.split(/(```[\s\S]*?```|`[^`\n]+`)/g);
  for (const part of parts) {
    if (part.startsWith("```") || (part.startsWith("`") && part.endsWith("`"))) {
      continue;
    }
    for (const match of part.matchAll(/(^|[^A-Za-z0-9_/])#([A-Za-z][A-Za-z0-9_-]*)/g)) {
      tags.add(match[2]);
    }
  }
  return [...tags];
}

export function NoteEditor({ path }: NoteEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef("");
  const pathRef = useRef(path);
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const saveGenerationRef = useRef(0);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [suggestions, setSuggestions] = useState<SearchHitDto[]>([]);
  const [tagRange, setTagRange] = useState<{ start: number; end: number } | null>(
    null,
  );
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  const folderPath = useMemo(() => {
    const normalized = path.replace(/\\/g, "/");
    const index = normalized.lastIndexOf("/");
    return index < 0 ? "" : normalized.slice(0, index);
  }, [path]);

  const accent = useMemo(() => colorForPath(path), [path]);
  const linkedTags = useMemo(() => extractLinkedTags(content), [content]);

  const clearSaveTimer = () => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  };

  const persist = async (notePath: string, nextContent: string) => {
    if (!loadedRef.current || !dirtyRef.current) {
      return;
    }

    const generation = ++saveGenerationRef.current;
    setSaveStatus("saving");
    setError(null);
    try {
      await knowledgeApi.updateNote(notePath, nextContent);
      if (
        generation === saveGenerationRef.current &&
        notePath === pathRef.current &&
        nextContent === contentRef.current
      ) {
        dirtyRef.current = false;
        setSaveStatus("saved");
      }
    } catch (err) {
      if (generation === saveGenerationRef.current) {
        setSaveStatus("error");
        setError(err instanceof Error ? err.message : "Failed to autosave");
      }
    }
  };

  const scheduleAutosave = (nextContent: string) => {
    if (!loadedRef.current) {
      return;
    }
    contentRef.current = nextContent;
    dirtyRef.current = true;
    setSaveStatus("unsaved");
    clearSaveTimer();
    saveTimerRef.current = window.setTimeout(() => {
      void persist(pathRef.current, contentRef.current);
    }, 650);
  };

  useEffect(() => {
    pathRef.current = path;
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    const activePath = path;
    clearSaveTimer();
    loadedRef.current = false;
    dirtyRef.current = false;
    setLoaded(false);
    setContent("");
    contentRef.current = "";
    setSaveStatus("saved");
    setError(null);

    void knowledgeApi
      .getNote(activePath)
      .then((note) => {
        if (cancelled) return;
        setName(note.name);
        setContent(note.content);
        contentRef.current = note.content;
        loadedRef.current = true;
        dirtyRef.current = false;
        setLoaded(true);
        setSaveStatus("saved");
        requestAnimationFrame(() => textareaRef.current?.focus());
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load note");
      });

    return () => {
      cancelled = true;
      clearSaveTimer();
      // Never flush before load completes — Strict Mode remounts were wiping notes with "".
      if (loadedRef.current && dirtyRef.current) {
        const pendingContent = contentRef.current;
        void knowledgeApi.updateNote(activePath, pendingContent).catch(() => undefined);
      }
    };
  }, [path]);

  const refreshTagSuggestions = (text: string, caret: number) => {
    const found = extractConceptQuery(text, caret);
    if (!found || found.query.length === 0) {
      setSuggestions([]);
      setTagRange(null);
      return;
    }

    setTagRange({ start: found.start, end: found.end });
    void knowledgeApi
      .search(found.query)
      .then((hits) => {
        const needle = normalizeConcept(found.query);
        const filtered = hits
          .filter((hit) => hit.path !== path)
          .filter((hit) => normalizeConcept(hit.name).startsWith(needle))
          .slice(0, 8);
        setSuggestions(filtered);
        setActiveSuggestion(0);
      })
      .catch(() => setSuggestions([]));
  };

  const applySuggestion = (hit: SearchHitDto) => {
    if (!tagRange) return;
    const insertion = tagFromName(hit.name);
    const next = replaceRange(content, tagRange.start, tagRange.end, insertion);
    const caret = tagRange.start + insertion.length;
    setContent(next);
    scheduleAutosave(next);
    setSuggestions([]);
    setTagRange(null);

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  };

  const resolveConcept = async (conceptName: string) => {
    setError(null);
    try {
      const hits = await knowledgeApi.search(conceptName);
      const needle = normalizeConcept(conceptName);
      const hit =
        hits.find((candidate) => normalizeConcept(candidate.name) === needle) ??
        hits.find((candidate) =>
          normalizeConcept(candidate.name).startsWith(needle),
        );

      if (!hit) {
        setError(`No concept found for #${conceptName}`);
        return;
      }

      if (hit.kind === "folder") {
        router.push(`/?path=${encodeURIComponent(hit.path)}`);
        return;
      }

      router.push(`/note?path=${encodeURIComponent(hit.path)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open concept");
    }
  };

  const insertImage = async (file: File | null) => {
    if (!file) return;
    try {
      const uploaded = await knowledgeApi.uploadMedia(folderPath, file);
      const next = `${contentRef.current.trimEnd()}\n\n${uploaded.markdown}\n`;
      setContent(next);
      scheduleAutosave(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const navigateFolder = (next: string) => {
    router.push(next ? `/?path=${encodeURIComponent(next)}` : "/");
  };

  const onEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      if (!loadedRef.current || !dirtyRef.current) return;
      clearSaveTimer();
      void persist(pathRef.current, contentRef.current);
      return;
    }

    if (suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((i) => (i - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      applySuggestion(suggestions[activeSuggestion]);
      return;
    }
    if (event.key === "Escape") {
      setSuggestions([]);
      setTagRange(null);
    }
  };

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "unsaved"
        ? "Editing…"
        : saveStatus === "error"
          ? "Autosave failed"
          : "Saved";

  return (
    <div
      className={styles.shell}
      style={{
        ["--note-accent" as string]: accent.fill,
        ["--note-border" as string]: accent.border,
      }}
    >
      <header className={styles.header}>
        <div className={styles.identity}>
          <div className={styles.brandRow}>
            <p className={styles.brand}>Concepts Organizer</p>
            <span className={styles.noteChip}>Note</span>
            <span
              className={`${styles.saveStatus} ${
                saveStatus === "error"
                  ? styles.saveError
                  : saveStatus === "saved"
                    ? styles.saveOk
                    : styles.saveBusy
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <div className={styles.crumbWrap}>
            <Breadcrumb path={folderPath} onNavigate={navigateFolder} />
          </div>
          <h1 className={styles.title}>{name || "Note"}</h1>
        </div>
        <div className={styles.actions}>
          <SearchBar />
          <button
            type="button"
            className={styles.button}
            onClick={() => navigateFolder(folderPath)}
          >
            Back to canvas
          </button>
          <label className={styles.button}>
            Insert image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => void insertImage(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.workspace}>
        <section className={styles.page} aria-label="Concept note editor">
          <div className={styles.editorPane}>
            <textarea
              ref={textareaRef}
              className={styles.editor}
              value={content}
              disabled={!loaded}
              onChange={(event) => {
                const next = event.target.value;
                setContent(next);
                scheduleAutosave(next);
                refreshTagSuggestions(next, event.target.selectionStart);
              }}
              onKeyUp={(event) => {
                refreshTagSuggestions(
                  event.currentTarget.value,
                  event.currentTarget.selectionStart,
                );
              }}
              onClick={(event) => {
                refreshTagSuggestions(
                  event.currentTarget.value,
                  event.currentTarget.selectionStart,
                );
              }}
              onBlur={() => {
                if (loadedRef.current && dirtyRef.current) {
                  clearSaveTimer();
                  void persist(pathRef.current, contentRef.current);
                }
              }}
              onKeyDown={onEditorKeyDown}
              spellCheck={true}
              aria-label="Concept document"
              placeholder="Start writing…"
            />
            {suggestions.length > 0 ? (
              <ul
                className={styles.suggestions}
                role="listbox"
                aria-label="Concept suggestions"
              >
                {suggestions.map((hit, index) => (
                  <li key={hit.path}>
                    <button
                      type="button"
                      className={`${styles.suggestion} ${index === activeSuggestion ? styles.suggestionActive : ""}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applySuggestion(hit);
                      }}
                    >
                      <span>{tagFromName(hit.name)}</span>
                      <span className={styles.suggestionMeta}>
                        {hit.kind} · {hit.parentPath || "Knowledge"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {linkedTags.length > 0 ? (
            <footer className={styles.footer}>
              <div className={styles.links} aria-label="Linked concepts">
                {linkedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.linkChip}
                    onClick={() => void resolveConcept(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </footer>
          ) : null}
        </section>
      </div>
    </div>
  );
}
