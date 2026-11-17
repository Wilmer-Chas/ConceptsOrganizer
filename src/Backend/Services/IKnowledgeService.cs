using Backend.Dto;

namespace Backend.Services;

public interface IKnowledgeService
{
    FolderContentsDto ListFolder(string? path);

    void CreateFolder(CreateFolderRequest request);

    void CreateNote(CreateNoteRequest request);

    NoteDto GetNote(string path);

    void UpdateNote(string path, UpdateNoteRequest request);

    void SaveLayout(string? path, SaveLayoutRequest request);

    void Move(MoveRequest request);

    void Rename(RenameRequest request);

    void Delete(DeleteRequest request);

    MediaUploadResponse UploadMedia(string folderPath, string fileName, Stream content);

    (string AbsolutePath, string ContentType)? GetMedia(string path);

    IReadOnlyList<SearchHitDto> Search(string query);
}
