using Backend.Domain;
using Backend.Dto;
using Backend.Repositories;

namespace Backend.Services;

public sealed class KnowledgeService : IKnowledgeService
{
    private readonly IKnowledgeRepository _repository;

    public KnowledgeService(IKnowledgeRepository repository)
    {
        _repository = repository;
    }

    public FolderContentsDto ListFolder(string? path)
    {
        var contents = _repository.ListFolder(Normalize(path));
        var layoutMap = contents.Layout.ToDictionary(l => l.RelativePath, StringComparer.OrdinalIgnoreCase);

        var entries = contents.Entries.Select(entry =>
        {
            layoutMap.TryGetValue(entry.RelativePath, out var pos);
            var defaults = entry.Kind == EntryKind.Folder
                ? (Width: 220.0, Height: 150.0)
                : (Width: 170.0, Height: 110.0);
            return new EntryDto(
                entry.Name,
                entry.RelativePath,
                entry.Kind.ToString().ToLowerInvariant(),
                pos?.X ?? 0,
                pos?.Y ?? 0,
                pos is { Width: > 0 } ? pos.Width : defaults.Width,
                pos is { Height: > 0 } ? pos.Height : defaults.Height);
        }).ToList();

        return new FolderContentsDto(contents.RelativePath, entries);
    }

    public void CreateFolder(CreateFolderRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.CreateFolder(Normalize(request.ParentPath), request.Name.Trim());
    }

    public void CreateNote(CreateNoteRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.CreateNote(Normalize(request.ParentPath), request.Name.Trim());
    }

    public NoteDto GetNote(string path)
    {
        var note = _repository.ReadNote(Normalize(path));
        return new NoteDto(note.RelativePath, note.Name, note.Content);
    }

    public void UpdateNote(string path, UpdateNoteRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.WriteNote(Normalize(path), request.Content);
    }

    public void SaveLayout(string? path, SaveLayoutRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        var positions = request.Items.Select(i => new LayoutPosition
        {
            RelativePath = Normalize(i.Path),
            X = i.X,
            Y = i.Y,
            Width = i.Width > 0 ? i.Width : 180,
            Height = i.Height > 0 ? i.Height : 110
        }).ToList();
        _repository.SaveLayout(Normalize(path), positions);
    }

    public void Move(MoveRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.Move(Normalize(request.SourcePath), Normalize(request.DestinationParentPath), request.NewName);
    }

    public void Rename(RenameRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.Rename(Normalize(request.Path), request.NewName.Trim());
    }

    public void Delete(DeleteRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);
        _repository.Delete(Normalize(request.Path));
    }

    public MediaUploadResponse UploadMedia(string folderPath, string fileName, Stream content)
    {
        var saved = _repository.SaveMedia(Normalize(folderPath), fileName, content);
        var file = Path.GetFileName(saved);
        var markdown = $"![](_media/{file})";
        return new MediaUploadResponse(saved, markdown);
    }

    public (string AbsolutePath, string ContentType)? GetMedia(string path) =>
        _repository.GetMedia(Normalize(path));

    public IReadOnlyList<SearchHitDto> Search(string query)
    {
        return _repository.Search(query)
            .Select(h => new SearchHitDto(
                h.RelativePath,
                h.Name,
                h.Kind.ToString().ToLowerInvariant(),
                h.ParentPath,
                h.Snippet))
            .ToList();
    }

    private static string Normalize(string? path) =>
        string.IsNullOrWhiteSpace(path) ? string.Empty : path.Replace('\\', '/').Trim('/');
}
