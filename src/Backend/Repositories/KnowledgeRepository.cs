using System.Text.Json;
using Backend.Domain;
using Backend.Persistence;

namespace Backend.Repositories;

public sealed class KnowledgeRepository : IKnowledgeRepository
{
    private const string LayoutFileName = ".layout.json";
    private const string MediaFolderName = "_media";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private readonly IKnowledgePathResolver _paths;

    public KnowledgeRepository(IKnowledgePathResolver paths)
    {
        _paths = paths;
    }

    public FolderContents ListFolder(string relativePath)
    {
        var absolute = _paths.Resolve(relativePath);
        if (!Directory.Exists(absolute))
        {
            throw new DirectoryNotFoundException($"Folder not found: {relativePath}");
        }

        var layout = ReadLayout(absolute);
        var layoutByPath = layout.ToDictionary(p => p.RelativePath, StringComparer.OrdinalIgnoreCase);
        var entries = new List<KnowledgeEntry>();

        foreach (var dir in Directory.EnumerateDirectories(absolute))
        {
            var name = Path.GetFileName(dir);
            if (IsHiddenName(name))
            {
                continue;
            }

            entries.Add(new KnowledgeEntry
            {
                Name = name,
                RelativePath = _paths.ToRelative(dir),
                Kind = EntryKind.Folder
            });
        }

        foreach (var file in Directory.EnumerateFiles(absolute, "*.md"))
        {
            var name = Path.GetFileNameWithoutExtension(file);
            entries.Add(new KnowledgeEntry
            {
                Name = name,
                RelativePath = _paths.ToRelative(file),
                Kind = EntryKind.Note
            });
        }

        entries = entries
            .OrderBy(e => e.Kind)
            .ThenBy(e => e.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var positions = entries.Select((entry, index) =>
        {
            if (layoutByPath.TryGetValue(entry.RelativePath, out var existing))
            {
                return existing;
            }

            var isFolder = entry.Kind == EntryKind.Folder;
            return new LayoutPosition
            {
                RelativePath = entry.RelativePath,
                X = 48 + (index % 4) * 240,
                Y = 48 + (index / 4) * 180,
                Width = isFolder ? 220 : 170,
                Height = isFolder ? 150 : 110
            };
        }).ToList();

        return new FolderContents
        {
            RelativePath = string.IsNullOrWhiteSpace(relativePath) ? string.Empty : relativePath.Replace('\\', '/').Trim('/'),
            Entries = entries,
            Layout = positions
        };
    }

    public void CreateFolder(string parentRelativePath, string name)
    {
        ValidateName(name);
        var parent = _paths.Resolve(parentRelativePath);
        Directory.CreateDirectory(parent);
        var target = Path.Combine(parent, name);
        if (Directory.Exists(target) || File.Exists(target))
        {
            throw new InvalidOperationException($"'{name}' already exists.");
        }

        Directory.CreateDirectory(target);
    }

    public void CreateNote(string parentRelativePath, string name)
    {
        ValidateName(name);
        var parent = _paths.Resolve(parentRelativePath);
        Directory.CreateDirectory(parent);
        var fileName = name.EndsWith(".md", StringComparison.OrdinalIgnoreCase) ? name : $"{name}.md";
        var target = Path.Combine(parent, fileName);
        if (File.Exists(target) || Directory.Exists(target))
        {
            throw new InvalidOperationException($"'{fileName}' already exists.");
        }

        File.WriteAllText(target, $"# {Path.GetFileNameWithoutExtension(fileName)}{Environment.NewLine}{Environment.NewLine}");
    }

    public NoteDocument ReadNote(string relativePath)
    {
        var absolute = RequireNoteFile(relativePath);
        return new NoteDocument
        {
            RelativePath = _paths.ToRelative(absolute),
            Name = Path.GetFileNameWithoutExtension(absolute),
            Content = File.ReadAllText(absolute)
        };
    }

    public void WriteNote(string relativePath, string content)
    {
        var absolute = RequireNoteFile(relativePath);
        File.WriteAllText(absolute, content ?? string.Empty);
    }

    public void SaveLayout(string folderRelativePath, IReadOnlyList<LayoutPosition> positions)
    {
        var absolute = _paths.Resolve(folderRelativePath);
        if (!Directory.Exists(absolute))
        {
            throw new DirectoryNotFoundException($"Folder not found: {folderRelativePath}");
        }

        var payload = positions.Select(p => new LayoutFileItem
        {
            Path = p.RelativePath.Replace('\\', '/'),
            X = p.X,
            Y = p.Y,
            Width = p.Width,
            Height = p.Height
        }).ToList();

        var layoutPath = Path.Combine(absolute, LayoutFileName);
        File.WriteAllText(layoutPath, JsonSerializer.Serialize(payload, JsonOptions));
    }

    public void Move(string sourceRelativePath, string destinationParentRelativePath, string? newName)
    {
        var source = _paths.Resolve(sourceRelativePath);
        var destinationParent = _paths.Resolve(destinationParentRelativePath);
        Directory.CreateDirectory(destinationParent);

        var sourceName = Path.GetFileName(source);
        var destinationName = string.IsNullOrWhiteSpace(newName) ? sourceName : newName.Trim();
        if (Directory.Exists(source) && destinationName.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Cannot rename a folder to a .md file name.");
        }

        if (File.Exists(source) && !destinationName.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            destinationName += ".md";
        }

        ValidateName(Path.GetFileNameWithoutExtension(destinationName) == destinationName
            ? destinationName
            : Path.GetFileNameWithoutExtension(destinationName));

        var destination = Path.Combine(destinationParent, destinationName);
        if (File.Exists(destination) || Directory.Exists(destination))
        {
            throw new InvalidOperationException("Destination already exists.");
        }

        if (Directory.Exists(source))
        {
            if (IsNestedMove(source, destination))
            {
                throw new InvalidOperationException("Cannot move a folder into itself.");
            }

            Directory.Move(source, destination);
        }
        else if (File.Exists(source))
        {
            File.Move(source, destination);
        }
        else
        {
            throw new FileNotFoundException("Source not found.", sourceRelativePath);
        }
    }

    public void Rename(string relativePath, string newName)
    {
        ValidateName(newName);
        var absolute = _paths.Resolve(relativePath);
        var parent = Path.GetDirectoryName(absolute) ?? _paths.RootPath;
        var parentRelative = _paths.ToRelative(parent);
        Move(relativePath, parentRelative, Directory.Exists(absolute) ? newName : $"{newName}.md");
    }

    public void Delete(string relativePath)
    {
        var absolute = _paths.Resolve(relativePath);
        if (Directory.Exists(absolute))
        {
            Directory.Delete(absolute, recursive: true);
            return;
        }

        if (File.Exists(absolute))
        {
            File.Delete(absolute);
            return;
        }

        throw new FileNotFoundException("Entry not found.", relativePath);
    }

    public string SaveMedia(string folderRelativePath, string fileName, Stream content)
    {
        var safeName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(safeName))
        {
            throw new InvalidOperationException("Invalid media file name.");
        }

        var folder = _paths.Resolve(folderRelativePath);
        if (!Directory.Exists(folder))
        {
            throw new DirectoryNotFoundException($"Folder not found: {folderRelativePath}");
        }

        var mediaDir = Path.Combine(folder, MediaFolderName);
        Directory.CreateDirectory(mediaDir);
        var target = Path.Combine(mediaDir, safeName);
        using (var fs = File.Create(target))
        {
            content.CopyTo(fs);
        }

        return _paths.ToRelative(target);
    }

    public (string AbsolutePath, string ContentType)? GetMedia(string relativePath)
    {
        var absolute = _paths.Resolve(relativePath);
        if (!File.Exists(absolute))
        {
            return null;
        }

        var contentType = Path.GetExtension(absolute).ToLowerInvariant() switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".svg" => "image/svg+xml",
            _ => "application/octet-stream"
        };

        return (absolute, contentType);
    }

    public IReadOnlyList<SearchHit> Search(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<SearchHit>();
        }

        _paths.EnsureRootExists();
        var hits = new List<SearchHit>();
        var term = query.Trim();

        foreach (var dir in Directory.EnumerateDirectories(_paths.RootPath, "*", SearchOption.AllDirectories))
        {
            var name = Path.GetFileName(dir);
            if (IsHiddenName(name))
            {
                continue;
            }

            if (name.Contains(term, StringComparison.OrdinalIgnoreCase))
            {
                var relative = _paths.ToRelative(dir);
                hits.Add(new SearchHit
                {
                    RelativePath = relative,
                    Name = name,
                    Kind = EntryKind.Folder,
                    ParentPath = ParentRelative(relative),
                    Snippet = null
                });
            }
        }

        foreach (var file in Directory.EnumerateFiles(_paths.RootPath, "*.md", SearchOption.AllDirectories))
        {
            if (file.Split(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                .Any(IsHiddenName))
            {
                continue;
            }

            var name = Path.GetFileNameWithoutExtension(file);
            var relative = _paths.ToRelative(file);
            string? snippet = null;
            var nameMatch = name.Contains(term, StringComparison.OrdinalIgnoreCase);
            if (!nameMatch)
            {
                var content = File.ReadAllText(file);
                var index = content.IndexOf(term, StringComparison.OrdinalIgnoreCase);
                if (index < 0)
                {
                    continue;
                }

                var start = Math.Max(0, index - 40);
                var length = Math.Min(content.Length - start, term.Length + 80);
                snippet = content.Substring(start, length).Replace('\n', ' ').Replace('\r', ' ');
            }

            hits.Add(new SearchHit
            {
                RelativePath = relative,
                Name = name,
                Kind = EntryKind.Note,
                ParentPath = ParentRelative(relative),
                Snippet = snippet
            });
        }

        return hits
            .OrderBy(h => h.Kind)
            .ThenBy(h => h.Name, StringComparer.OrdinalIgnoreCase)
            .Take(100)
            .ToList();
    }

    private string RequireNoteFile(string relativePath)
    {
        var absolute = _paths.Resolve(relativePath);
        if (!File.Exists(absolute) || !absolute.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
        {
            throw new FileNotFoundException("Note not found.", relativePath);
        }

        return absolute;
    }

    private List<LayoutPosition> ReadLayout(string folderAbsolutePath)
    {
        var layoutPath = Path.Combine(folderAbsolutePath, LayoutFileName);
        if (!File.Exists(layoutPath))
        {
            return new List<LayoutPosition>();
        }

        try
        {
            var json = File.ReadAllText(layoutPath);
            var items = JsonSerializer.Deserialize<List<LayoutFileItem>>(json, JsonOptions) ?? new List<LayoutFileItem>();
            return items
                .Where(i => !string.IsNullOrWhiteSpace(i.Path))
                .Select(i => new LayoutPosition
                {
                    RelativePath = i.Path.Replace('\\', '/'),
                    X = i.X,
                    Y = i.Y,
                    Width = i.Width > 0 ? i.Width : 180,
                    Height = i.Height > 0 ? i.Height : 110
                })
                .ToList();
        }
        catch (JsonException)
        {
            return new List<LayoutPosition>();
        }
    }

    private static string ParentRelative(string relativePath)
    {
        var normalized = relativePath.Replace('\\', '/').Trim('/');
        var index = normalized.LastIndexOf('/');
        return index < 0 ? string.Empty : normalized[..index];
    }

    private static bool IsNestedMove(string sourceDir, string destinationDir)
    {
        var source = sourceDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                     + Path.DirectorySeparatorChar;
        var dest = destinationDir.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                   + Path.DirectorySeparatorChar;
        return dest.StartsWith(source, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsHiddenName(string name) =>
        name.StartsWith(".", StringComparison.Ordinal)
        || string.Equals(name, MediaFolderName, StringComparison.OrdinalIgnoreCase);

    private static void ValidateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("Name is required.");
        }

        var trimmed = name.Trim();
        if (trimmed is "." or ".." || trimmed.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0)
        {
            throw new InvalidOperationException("Name contains invalid characters.");
        }

        if (trimmed.StartsWith(".", StringComparison.Ordinal)
            || string.Equals(trimmed, MediaFolderName, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Reserved name.");
        }
    }

    private sealed class LayoutFileItem
    {
        public string Path { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
        public double Width { get; set; }
        public double Height { get; set; }
    }
}
