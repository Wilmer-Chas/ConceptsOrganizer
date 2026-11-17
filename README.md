# Concepts Organizer

Filesystem-backed concept notes with a freeform drill-in canvas.

- **Backend:** ASP.NET Core (`src/Backend`) manages real folders and Markdown notes under `data/knowledge`
- **Frontend:** Next.js (`src/Frontend`) — canvas, breadcrumb, editor, instant search

## Run locally

Terminal 1 — API (http://localhost:5086):

```powershell
dotnet run --project src/Backend --launch-profile http
```

Terminal 2 — UI (http://localhost:3000):

```powershell
cd src/Frontend
npm run dev
```

## Tests

```powershell
dotnet test
```

## Knowledge root

Notes live as real files in `data/knowledge`. Each folder can have a `.layout.json` for canvas positions/sizes and a `_media/` folder for images.

## Canvas tips

- Single-click a folder or note to open it
- Click empty canvas space for **New folder / New note**
- Drag to move, drag the bottom-right handle to resize
- Right-click an item to rename or delete
