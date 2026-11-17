using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/folders")]
public sealed class FoldersController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public FoldersController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<FolderContentsDto> List([FromQuery] string? path)
    {
        try
        {
            return Ok(_service.ListFolder(path));
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateFolderRequest request)
    {
        try
        {
            _service.CreateFolder(request);
            return CreatedAtAction(nameof(List), new { path = Combine(request.ParentPath, request.Name) }, null);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private static string Combine(string? parent, string name)
    {
        var p = string.IsNullOrWhiteSpace(parent) ? string.Empty : parent.Trim('/');
        return string.IsNullOrEmpty(p) ? name : $"{p}/{name}";
    }
}
