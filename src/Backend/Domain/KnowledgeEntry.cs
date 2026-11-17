namespace Backend.Domain;

public sealed class KnowledgeEntry
{
    public required string Name { get; init; }
    public required string RelativePath { get; init; }
    public required EntryKind Kind { get; init; }
}

public sealed class LayoutPosition
{
    public required string RelativePath { get; init; }
    public required double X { get; init; }
    public required double Y { get; init; }
    public double Width { get; init; } = 180;
    public double Height { get; init; } = 110;
}

public sealed class FolderContents
{
    public required string RelativePath { get; init; }
    public required IReadOnlyList<KnowledgeEntry> Entries { get; init; }
    public required IReadOnlyList<LayoutPosition> Layout { get; init; }
}

public sealed class NoteDocument
{
    public required string RelativePath { get; init; }
    public required string Name { get; init; }
    public required string Content { get; init; }
}

public sealed class SearchHit
{
    public required string RelativePath { get; init; }
    public required string Name { get; init; }
    public required EntryKind Kind { get; init; }
    public required string ParentPath { get; init; }
    public string? Snippet { get; init; }
}
