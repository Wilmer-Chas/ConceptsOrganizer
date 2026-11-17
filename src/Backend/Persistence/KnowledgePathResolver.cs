using Microsoft.Extensions.Options;

namespace Backend.Persistence;

public sealed class KnowledgePathResolver : IKnowledgePathResolver
{
    private readonly string _rootPath;

    public KnowledgePathResolver(IOptions<KnowledgeRootOptions> options, IHostEnvironment environment)
    {
        var configured = options.Value.Path;
        _rootPath = Path.IsPathRooted(configured)
            ? Path.GetFullPath(configured)
            : Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "..", configured));
    }

    public string RootPath => _rootPath;

    public void EnsureRootExists()
    {
        Directory.CreateDirectory(_rootPath);
    }

    public string Resolve(string? relativePath)
    {
        EnsureRootExists();

        var normalized = NormalizeRelative(relativePath);
        if (normalized.Length == 0)
        {
            return _rootPath;
        }

        var combined = Path.GetFullPath(Path.Combine(_rootPath, normalized));
        if (!IsUnderRoot(combined))
        {
            throw new InvalidOperationException("Path escapes the knowledge root.");
        }

        return combined;
    }

    public string ToRelative(string absolutePath)
    {
        var full = Path.GetFullPath(absolutePath);
        if (!IsUnderRoot(full))
        {
            throw new InvalidOperationException("Path is outside the knowledge root.");
        }

        if (string.Equals(full, _rootPath, StringComparison.OrdinalIgnoreCase))
        {
            return string.Empty;
        }

        var relative = Path.GetRelativePath(_rootPath, full);
        return relative.Replace('\\', '/');
    }

    private bool IsUnderRoot(string absolutePath)
    {
        var rootWithSep = _rootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                          + Path.DirectorySeparatorChar;
        var candidate = absolutePath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                        + Path.DirectorySeparatorChar;
        return candidate.StartsWith(rootWithSep, StringComparison.OrdinalIgnoreCase)
               || string.Equals(absolutePath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                   _rootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                   StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeRelative(string? relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
        {
            return string.Empty;
        }

        var trimmed = relativePath.Replace('\\', '/').Trim('/');
        if (trimmed.Contains("..", StringComparison.Ordinal) || Path.IsPathRooted(trimmed))
        {
            throw new InvalidOperationException("Invalid relative path.");
        }

        return trimmed.Replace('/', Path.DirectorySeparatorChar);
    }
}
