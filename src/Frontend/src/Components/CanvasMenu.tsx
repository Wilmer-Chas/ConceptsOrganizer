"use client";

import styles from "./CanvasMenu.module.css";

export type CanvasMenuAction =
  | "new-folder"
  | "new-note"
  | "rename"
  | "delete";

interface CanvasMenuProps {
  x: number;
  y: number;
  mode: "create" | "item";
  onAction: (action: CanvasMenuAction) => void;
  onClose: () => void;
}

export function CanvasMenu({ x, y, mode, onAction, onClose }: CanvasMenuProps) {
  return (
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={styles.menu}
        style={{ left: x, top: y }}
        role="menu"
      >
        {mode === "create" ? (
          <>
            <button
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => onAction("new-folder")}
            >
              <span className={`${styles.swatch} ${styles.swatchFolder}`} />
              New folder
            </button>
            <button
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => onAction("new-note")}
            >
              <span className={`${styles.swatch} ${styles.swatchNote}`} />
              New note
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.item}
              role="menuitem"
              onClick={() => onAction("rename")}
            >
              Rename
            </button>
            <button
              type="button"
              className={`${styles.item} ${styles.danger}`}
              role="menuitem"
              onClick={() => onAction("delete")}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </>
  );
}
