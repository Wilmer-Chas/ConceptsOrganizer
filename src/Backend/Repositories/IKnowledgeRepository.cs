using Backend.Domain;

namespace Backend.Repositories;

public interface IKnowledgeRepository
{
    FolderContents ListFolder(string relativePath);

    void CreateFolder(string parentRelativePath, string name);

    void CreateNote(string parentRelativePath, string name);

    NoteDocument ReadNote(string relativePath);

    void WriteNote(string relativePath, string content);

    void SaveLayout(string folderRelativePath, IReadOnlyList<LayoutPosition> positions);

    void Move(string sourceRelativePath, string destinationParentRelativePath, string? newName);

    void Rename(string relativePath, string newName);

    void Delete(string relativePath);

    string SaveMedia(string folderRelativePath, string fileName, Stream content);

    (string AbsolutePath, string ContentType)? GetMedia(string relativePath);

    IReadOnlyList<SearchHit> Search(string query);
}
