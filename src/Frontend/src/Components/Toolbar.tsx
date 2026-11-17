import styles from "./Toolbar.module.css";

interface ToolbarProps {
  onCreateFolder: () => void;
  onCreateNote: () => void;
}

export function Toolbar({ onCreateFolder, onCreateNote }: ToolbarProps) {
  return (
    <div className={styles.bar}>
      <button type="button" className={styles.button} onClick={onCreateFolder}>
        New folder
      </button>
      <button type="button" className={styles.button} onClick={onCreateNote}>
        New note
      </button>
    </div>
  );
}
