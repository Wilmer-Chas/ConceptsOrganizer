namespace Backend.Persistence;

public interface IKnowledgePathResolver
{
    string RootPath { get; }

    string Resolve(string? relativePath);

    string ToRelative(string absolutePath);

    void EnsureRootExists();
}
