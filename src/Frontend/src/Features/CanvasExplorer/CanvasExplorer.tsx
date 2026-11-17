"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { knowledgeApi } from "@/Api/knowledgeApi";
import type { EntryDto } from "@/Api/types";
import { Breadcrumb } from "@/Components/Breadcrumb";
import {
  CanvasMenu,
  type CanvasMenuAction,
} from "@/Components/CanvasMenu";
import { DraggableTile } from "@/Components/DraggableTile";
import { SearchBar } from "@/Components/SearchBar";
import styles from "./CanvasExplorer.module.css";

interface CanvasExplorerProps {
  initialPath?: string;
}

interface MenuState {
  mode: "create" | "item";
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  entry?: EntryDto;
}

export function CanvasExplorer({ initialPath = "" }: CanvasExplorerProps) {
  const router = useRouter();
  const [path, setPath] = useState(initialPath);
  const [entries, setEntries] = useState<EntryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<MenuState | null>(null);

  const load = useCallback(async (folderPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await knowledgeApi.listFolder(folderPath);
      setEntries(data.entries);
      setPath(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folder");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(initialPath);
  }, [initialPath, load]);

  const navigate = (next: string) => {
    setMenu(null);
    setPath(next);
    const href = next ? `/?path=${encodeURIComponent(next)}` : "/";
    router.push(href);
    void load(next);
  };

  const toLayoutItems = (nextEntries: EntryDto[]) =>
    nextEntries.map((entry) => ({
      path: entry.path,
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height,
    }));

  const persistLayout = async (nextEntries: EntryDto[]) => {
    await knowledgeApi.saveLayout(path, toLayoutItems(nextEntries));
  };

  const updatePosition = (entryPath: string, x: number, y: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.path === entryPath ? { ...entry, x, y } : entry,
      ),
    );
  };

  const updateSize = (entryPath: string, width: number, height: number) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.path === entryPath ? { ...entry, width, height } : entry,
      ),
    );
  };

  const commitLayoutPatch = async (
    patch: (entry: EntryDto) => EntryDto,
    entryPath: string,
  ) => {
    let nextSnapshot: EntryDto[] = [];
    setEntries((current) => {
      nextSnapshot = current.map((entry) =>
        entry.path === entryPath ? patch(entry) : entry,
      );
      return nextSnapshot;
    });
    try {
      await persistLayout(nextSnapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save layout");
    }
  };

  const openEntry = (entry: EntryDto) => {
    if (entry.kind === "folder") {
      navigate(entry.path);
      return;
    }
    router.push(`/note?path=${encodeURIComponent(entry.path)}`);
  };

  const placeNewEntry = async (
    kind: "folder" | "note",
    name: string,
    x: number,
    y: number,
  ) => {
    if (kind === "folder") {
      await knowledgeApi.createFolder(path, name);
    } else {
      await knowledgeApi.createNote(path, name);
    }

    const data = await knowledgeApi.listFolder(path);
    const createdPath = (
      kind === "folder"
        ? path
          ? `${path}/${name}`
          : name
        : path
          ? `${path}/${name}.md`
          : `${name}.md`
    ).replace(/\\/g, "/");

    const exact =
      data.entries.find(
        (entry) => entry.path.replace(/\\/g, "/").toLowerCase() === createdPath.toLowerCase(),
      ) ??
      data.entries.find(
        (entry) =>
          entry.kind === kind && entry.name.toLowerCase() === name.toLowerCase(),
      );

    const withPlacement = data.entries.map((entry) => {
      if (!exact || entry.path !== exact.path) {
        return entry;
      }
      return {
        ...entry,
        x,
        y,
        width: kind === "folder" ? 220 : 170,
        height: kind === "folder" ? 150 : 110,
      };
    });

    setEntries(withPlacement);
    await persistLayout(withPlacement);
  };

  const handleMenuAction = async (action: CanvasMenuAction) => {
    if (!menu) return;
    const current = menu;
    setMenu(null);

    try {
      if (action === "new-folder") {
        const name = window.prompt("Folder name");
        if (!name?.trim()) return;
        await placeNewEntry("folder", name.trim(), current.canvasX, current.canvasY);
        return;
      }
      if (action === "new-note") {
        const name = window.prompt("Note name");
        if (!name?.trim()) return;
        await placeNewEntry("note", name.trim(), current.canvasX, current.canvasY);
        return;
      }
      if (!current.entry) return;
      if (action === "rename") {
        const nextName = window.prompt("New name", current.entry.name);
        if (!nextName?.trim()) return;
        await knowledgeApi.rename(current.entry.path, nextName.trim());
        await load(path);
        return;
      }
      if (action === "delete") {
        if (!window.confirm(`Delete "${current.entry.name}"?`)) return;
        await knowledgeApi.delete(current.entry.path);
        await load(path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const openCreateMenu = (
    clientX: number,
    clientY: number,
    canvasX: number,
    canvasY: number,
  ) => {
    setMenu({
      mode: "create",
      x: clientX,
      y: clientY,
      canvasX,
      canvasY,
    });
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <p className={styles.brand}>Concepts Organizer</p>
          <Breadcrumb path={path} onNavigate={navigate} />
        </div>
        <div className={styles.actions}>
          <SearchBar />
        </div>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div
        className={styles.canvas}
        aria-label="Concept canvas"
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          openCreateMenu(
            event.clientX,
            event.clientY,
            event.clientX - rect.left + event.currentTarget.scrollLeft,
            event.clientY - rect.top + event.currentTarget.scrollTop,
          );
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          openCreateMenu(
            event.clientX,
            event.clientY,
            event.clientX - rect.left + event.currentTarget.scrollLeft,
            event.clientY - rect.top + event.currentTarget.scrollTop,
          );
        }}
      >
        {loading ? <p className={styles.hint}>Loading…</p> : null}
        {!loading && entries.length === 0 ? (
          <p className={styles.hint}>
            Click empty space to add a colorful folder or note.
          </p>
        ) : null}
        {entries.map((entry) => (
          <DraggableTile
            key={entry.path}
            entry={entry}
            onPositionChange={updatePosition}
            onSizeChange={updateSize}
            onDragEnd={(p, x, y) =>
              void commitLayoutPatch((entryItem) => ({ ...entryItem, x, y }), p)
            }
            onResizeEnd={(p, width, height) =>
              void commitLayoutPatch(
                (entryItem) => ({ ...entryItem, width, height }),
                p,
              )
            }
            onOpen={openEntry}
            onDropOntoFolder={(source, folder) => {
              void (async () => {
                try {
                  await knowledgeApi.move(source, folder);
                  await load(path);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to move item");
                  await load(path);
                }
              })();
            }}
            onItemContextMenu={(item, x, y) => {
              setMenu({
                mode: "item",
                x,
                y,
                canvasX: item.x,
                canvasY: item.y,
                entry: item,
              });
            }}
          />
        ))}
      </div>

      {menu ? (
        <CanvasMenu
          x={menu.x}
          y={menu.y}
          mode={menu.mode}
          onAction={(action) => void handleMenuAction(action)}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  );
}
