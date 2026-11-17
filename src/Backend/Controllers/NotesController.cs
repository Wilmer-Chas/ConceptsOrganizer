using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/notes")]
public sealed class NotesController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public NotesController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<NoteDto> Get([FromQuery] string path)
    {
        try
        {
            return Ok(_service.GetNote(path));
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateNoteRequest request)
    {
        try
        {
            _service.CreateNote(request);
            var noteName = request.Name.EndsWith(".md", StringComparison.OrdinalIgnoreCase)
                ? request.Name
                : $"{request.Name}.md";
            var parent = string.IsNullOrWhiteSpace(request.ParentPath) ? string.Empty : request.ParentPath.Trim('/');
            var path = string.IsNullOrEmpty(parent) ? noteName : $"{parent}/{noteName}";
            return CreatedAtAction(nameof(Get), new { path }, null);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut]
    public IActionResult Update([FromQuery] string path, [FromBody] UpdateNoteRequest request)
    {
        try
        {
            _service.UpdateNote(path, request);
            return NoContent();
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
