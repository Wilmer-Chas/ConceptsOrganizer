import styles from "./Breadcrumb.module.css";

interface BreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const segments = path
    ? path.split("/").filter(Boolean)
    : [];

  return (
    <nav className={styles.bar} aria-label="Folder hierarchy">
      <button type="button" className={styles.crumb} onClick={() => onNavigate("")}>
        Knowledge
      </button>
      {segments.map((segment, index) => {
        const target = segments.slice(0, index + 1).join("/");
        return (
          <span key={target} className={styles.item}>
            <span className={styles.sep}>/</span>
            <button
              type="button"
              className={styles.crumb}
              onClick={() => onNavigate(target)}
            >
              {segment}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
