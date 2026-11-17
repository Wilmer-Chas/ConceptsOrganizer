namespace Backend.Dto;

public sealed record EntryDto(
    string Name,
    string Path,
    string Kind,
    double X,
    double Y,
    double Width,
    double Height);

public sealed record FolderContentsDto(string Path, IReadOnlyList<EntryDto> Entries);

public sealed record CreateFolderRequest(string ParentPath, string Name);

public sealed record CreateNoteRequest(string ParentPath, string Name);

public sealed record NoteDto(string Path, string Name, string Content);

public sealed record UpdateNoteRequest(string Content);

public sealed record LayoutItemDto(string Path, double X, double Y, double Width, double Height);

public sealed record SaveLayoutRequest(IReadOnlyList<LayoutItemDto> Items);

public sealed record MoveRequest(string SourcePath, string DestinationParentPath, string? NewName);

public sealed record MediaUploadResponse(string Path, string Markdown);

public sealed record SearchHitDto(string Path, string Name, string Kind, string ParentPath, string? Snippet);

public sealed record RenameRequest(string Path, string NewName);

public sealed record DeleteRequest(string Path);
