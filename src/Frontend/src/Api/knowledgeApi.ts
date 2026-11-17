import { apiGet, apiSend, apiUpload, mediaUrl } from "./client";
import type {
  FolderContentsDto,
  LayoutItemDto,
  MediaUploadResponse,
  NoteDto,
  SearchHitDto,
} from "./types";

export const knowledgeApi = {
  listFolder(path: string) {
    const query = path ? `?path=${encodeURIComponent(path)}` : "?path=";
    return apiGet<FolderContentsDto>(`/api/folders${query}`);
  },

  createFolder(parentPath: string, name: string) {
    return apiSend("/api/folders", "POST", { parentPath, name });
  },

  createNote(parentPath: string, name: string) {
    return apiSend("/api/notes", "POST", { parentPath, name });
  },

  getNote(path: string) {
    return apiGet<NoteDto>(`/api/notes?path=${encodeURIComponent(path)}`);
  },

  updateNote(path: string, content: string) {
    return apiSend(`/api/notes?path=${encodeURIComponent(path)}`, "PUT", {
      content,
    });
  },

  saveLayout(path: string, items: LayoutItemDto[]) {
    const query = path ? `?path=${encodeURIComponent(path)}` : "?path=";
    return apiSend(`/api/layout${query}`, "PUT", { items });
  },

  move(sourcePath: string, destinationParentPath: string, newName?: string) {
    return apiSend("/api/entries/move", "POST", {
      sourcePath,
      destinationParentPath,
      newName: newName ?? null,
    });
  },

  rename(path: string, newName: string) {
    return apiSend("/api/entries/rename", "POST", { path, newName });
  },

  delete(path: string) {
    return apiSend("/api/entries/delete", "POST", { path });
  },

  search(q: string) {
    return apiGet<SearchHitDto[]>(`/api/search?q=${encodeURIComponent(q)}`);
  },

  uploadMedia(folderPath: string, file: File) {
    const form = new FormData();
    form.append("folderPath", folderPath);
    form.append("file", file);
    return apiUpload<MediaUploadResponse>("/api/media", form);
  },

  resolveMediaUrl(folderPath: string, markdownSrc: string) {
    if (markdownSrc.startsWith("http://") || markdownSrc.startsWith("https://")) {
      return markdownSrc;
    }
    const cleaned = markdownSrc.replace(/^\.\//, "");
    const absolute = folderPath ? `${folderPath}/${cleaned}` : cleaned;
    return mediaUrl(absolute.replace(/\\/g, "/"));
  },
};
