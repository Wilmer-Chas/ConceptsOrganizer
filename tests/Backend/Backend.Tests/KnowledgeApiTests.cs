using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Backend.Dto;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Backend.Tests;

public class KnowledgeApiTests : IClassFixture<KnowledgeApiTests.KnowledgeWebApplicationFactory>, IDisposable
{
    private readonly KnowledgeWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly string _root;

    public KnowledgeApiTests(KnowledgeWebApplicationFactory factory)
    {
        _factory = factory;
        _root = factory.KnowledgeRoot;
        Directory.CreateDirectory(_root);
        ClearDirectory(_root);
        _client = factory.CreateClient();
    }

    public void Dispose()
    {
        ClearDirectory(_root);
        _client.Dispose();
    }

    [Fact]
    public async Task List_Empty_Root_Returns_Empty_Entries()
    {
        var response = await _client.GetAsync("/api/folders?path=");
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<FolderContentsDto>();
        body!.Entries.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateFolder_And_Note_Then_List()
    {
        var folderResponse = await _client.PostAsJsonAsync("/api/folders", new CreateFolderRequest("", "Programming"));
        folderResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var noteResponse = await _client.PostAsJsonAsync("/api/notes", new CreateNoteRequest("Programming", "Closures"));
        noteResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var list = await _client.GetFromJsonAsync<FolderContentsDto>("/api/folders?path=Programming");
        list!.Entries.Should().ContainSingle(e => e.Name == "Closures" && e.Kind == "note");
        Directory.Exists(Path.Combine(_root, "Programming")).Should().BeTrue();
        File.Exists(Path.Combine(_root, "Programming", "Closures.md")).Should().BeTrue();
    }

    [Fact]
    public async Task UpdateNote_Persists_Content()
    {
        await _client.PostAsJsonAsync("/api/notes", new CreateNoteRequest("", "Async"));
        var update = await _client.PutAsJsonAsync("/api/notes?path=Async.md", new UpdateNoteRequest("# Async\n\nPromises matter."));
        update.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var note = await _client.GetFromJsonAsync<NoteDto>("/api/notes?path=Async.md");
        note!.Content.Should().Contain("Promises matter.");
    }

    [Fact]
    public async Task SaveLayout_And_List_Returns_Positions()
    {
        await _client.PostAsJsonAsync("/api/folders", new CreateFolderRequest("", "A"));
        await _client.PostAsJsonAsync("/api/notes", new CreateNoteRequest("", "B"));

        var layout = new SaveLayoutRequest(new[]
        {
            new LayoutItemDto("A", 120, 80, 240, 160),
            new LayoutItemDto("B.md", 300, 160, 180, 120)
        });

        var save = await _client.PutAsJsonAsync("/api/layout?path=", layout);
        save.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var list = await _client.GetFromJsonAsync<FolderContentsDto>("/api/folders?path=");
        list!.Entries.Should().Contain(e => e.Path == "A" && e.X == 120 && e.Y == 80 && e.Width == 240 && e.Height == 160);
        list.Entries.Should().Contain(e => e.Path == "B.md" && e.X == 300 && e.Y == 160 && e.Width == 180 && e.Height == 120);
    }

    [Fact]
    public async Task Move_Renames_And_Relocates()
    {
        await _client.PostAsJsonAsync("/api/folders", new CreateFolderRequest("", "Target"));
        await _client.PostAsJsonAsync("/api/notes", new CreateNoteRequest("", "MoveMe"));

        var move = await _client.PostAsJsonAsync("/api/entries/move", new MoveRequest("MoveMe.md", "Target", "Moved"));
        move.StatusCode.Should().Be(HttpStatusCode.NoContent);

        File.Exists(Path.Combine(_root, "Target", "Moved.md")).Should().BeTrue();
        File.Exists(Path.Combine(_root, "MoveMe.md")).Should().BeFalse();
    }

    [Fact]
    public async Task Search_Finds_By_Name_And_Content()
    {
        await _client.PostAsJsonAsync("/api/folders", new CreateFolderRequest("", "Algorithms"));
        await _client.PostAsJsonAsync("/api/notes", new CreateNoteRequest("Algorithms", "Sorting"));
        await _client.PutAsJsonAsync("/api/notes?path=Algorithms/Sorting.md", new UpdateNoteRequest("quicksort and mergesort"));

        var byName = await _client.GetFromJsonAsync<List<SearchHitDto>>("/api/search?q=Sort");
        byName!.Should().Contain(h => h.Name == "Sorting");

        var byContent = await _client.GetFromJsonAsync<List<SearchHitDto>>("/api/search?q=mergesort");
        byContent!.Should().Contain(h => h.Name == "Sorting" && h.Snippet != null);
    }

    [Fact]
    public async Task Rejects_Path_Escape()
    {
        var response = await _client.GetAsync("/api/folders?path=../secret");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UploadMedia_Writes_Under_Media_Folder()
    {
        await _client.PostAsJsonAsync("/api/folders", new CreateFolderRequest("", "MediaFolder"));

        using var form = new MultipartFormDataContent();
        form.Add(new StringContent("MediaFolder"), "folderPath");
        var bytes = new ByteArrayContent(new byte[] { 0x89, 0x50, 0x4E, 0x47 });
        bytes.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        form.Add(bytes, "file", "diagram.png");

        var response = await _client.PostAsync("/api/media", form);
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var payload = await response.Content.ReadFromJsonAsync<MediaUploadResponse>();
        payload!.Markdown.Should().Be("![](_media/diagram.png)");
        File.Exists(Path.Combine(_root, "MediaFolder", "_media", "diagram.png")).Should().BeTrue();
    }

    private static void ClearDirectory(string path)
    {
        if (!Directory.Exists(path))
        {
            return;
        }

        foreach (var entry in Directory.EnumerateFileSystemEntries(path))
        {
            if (Directory.Exists(entry))
            {
                Directory.Delete(entry, true);
            }
            else
            {
                File.Delete(entry);
            }
        }
    }

    public sealed class KnowledgeWebApplicationFactory : WebApplicationFactory<Program>
    {
        public string KnowledgeRoot { get; } = Path.Combine(Path.GetTempPath(), "concepts-organizer-tests", Guid.NewGuid().ToString("N"));

        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            Directory.CreateDirectory(KnowledgeRoot);
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["KnowledgeRoot:Path"] = KnowledgeRoot
                });
            });
        }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);
            if (Directory.Exists(KnowledgeRoot))
            {
                try
                {
                    Directory.Delete(KnowledgeRoot, true);
                }
                catch
                {
                    // ignore cleanup races on Windows
                }
            }
        }
    }
}
