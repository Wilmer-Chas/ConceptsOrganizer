export type EntryKind = "folder" | "note";

export interface EntryDto {
  name: string;
  path: string;
  kind: EntryKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FolderContentsDto {
  path: string;
  entries: EntryDto[];
}

export interface NoteDto {
  path: string;
  name: string;
  content: string;
}

export interface SearchHitDto {
  path: string;
  name: string;
  kind: EntryKind;
  parentPath: string;
  snippet?: string | null;
}

export interface MediaUploadResponse {
  path: string;
  markdown: string;
}

export interface LayoutItemDto {
  path: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
