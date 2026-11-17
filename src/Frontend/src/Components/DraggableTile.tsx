"use client";

import type { EntryDto } from "@/Api/types";
import { colorForPath } from "@/Components/tileColors";
import styles from "./DraggableTile.module.css";

interface DraggableTileProps {
  entry: EntryDto;
  onPositionChange: (path: string, x: number, y: number) => void;
  onSizeChange: (path: string, width: number, height: number) => void;
  onDragEnd: (path: string, x: number, y: number) => void;
  onResizeEnd: (path: string, width: number, height: number) => void;
  onOpen: (entry: EntryDto) => void;
  onDropOntoFolder?: (sourcePath: string, folderPath: string) => void;
  onItemContextMenu?: (entry: EntryDto, x: number, y: number) => void;
}

const MIN_WIDTH = 120;
const MIN_HEIGHT = 80;

export function DraggableTile({
  entry,
  onPositionChange,
  onSizeChange,
  onDragEnd,
  onResizeEnd,
  onOpen,
  onDropOntoFolder,
  onItemContextMenu,
}: DraggableTileProps) {
  const colors = colorForPath(entry.path);
  const width = entry.width || (entry.kind === "folder" ? 220 : 170);
  const height = entry.height || (entry.kind === "folder" ? 150 : 110);

  return (
    <div
      className={`${styles.tile} ${entry.kind === "folder" ? styles.folder : styles.note}`}
      style={{
        transform: `translate(${entry.x}px, ${entry.y}px)`,
        width,
        height,
        background: colors.fill,
        borderColor: colors.border,
        ["--tile-header" as string]: colors.header,
      }}
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        if ((event.target as HTMLElement).dataset.resize === "true") return;

        const target = event.currentTarget;
        target.setPointerCapture(event.pointerId);
        const startX = event.clientX;
        const startY = event.clientY;
        const originX = entry.x;
        const originY = entry.y;
        let lastX = originX;
        let lastY = originY;
        let moved = false;

        target.style.pointerEvents = "none";
        target.classList.add(styles.dragging);

        const onMove = (moveEvent: PointerEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.abs(dx) + Math.abs(dy) > 4) {
            moved = true;
          }
          lastX = Math.max(0, originX + dx);
          lastY = Math.max(0, originY + dy);
          onPositionChange(entry.path, lastX, lastY);
        };

        const onUp = (upEvent: PointerEvent) => {
          target.style.pointerEvents = "";
          target.classList.remove(styles.dragging);
          target.releasePointerCapture(event.pointerId);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);

          if (!moved) {
            onOpen(entry);
            return;
          }

          const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
          const folderTarget = el?.closest("[data-folder-path]") as HTMLElement | null;
          const dropPath = folderTarget?.dataset.folderPath;
          if (dropPath && dropPath !== entry.path && onDropOntoFolder) {
            onDropOntoFolder(entry.path, dropPath);
            return;
          }

          onDragEnd(entry.path, lastX, lastY);
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onItemContextMenu?.(entry, event.clientX, event.clientY);
      }}
      data-folder-path={entry.kind === "folder" ? entry.path : undefined}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onOpen(entry);
        }
      }}
    >
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden>
          {entry.kind === "folder" ? "▣" : "▤"}
        </span>
        <span className={styles.kind}>
          {entry.kind === "folder" ? "Folder" : "Note"}
        </span>
      </div>
      <span className={styles.label}>{entry.name}</span>
      <span
        className={styles.resize}
        data-resize="true"
        onPointerDown={(event) => {
          event.stopPropagation();
          event.preventDefault();
          if (event.button !== 0) return;

          const startX = event.clientX;
          const startY = event.clientY;
          const originW = width;
          const originH = height;
          let lastW = originW;
          let lastH = originH;

          const onMove = (moveEvent: PointerEvent) => {
            lastW = Math.max(MIN_WIDTH, originW + (moveEvent.clientX - startX));
            lastH = Math.max(MIN_HEIGHT, originH + (moveEvent.clientY - startY));
            onSizeChange(entry.path, lastW, lastH);
          };

          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            onResizeEnd(entry.path, lastW, lastH);
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      />
    </div>
  );
}
