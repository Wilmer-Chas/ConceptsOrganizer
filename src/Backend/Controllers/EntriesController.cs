using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/entries")]
public sealed class EntriesController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public EntriesController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpPost("move")]
    public IActionResult Move([FromBody] MoveRequest request)
    {
        try
        {
            _service.Move(request);
            return NoContent();
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
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

    [HttpPost("rename")]
    public IActionResult Rename([FromBody] RenameRequest request)
    {
        try
        {
            _service.Rename(request);
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

    [HttpPost("delete")]
    public IActionResult Delete([FromBody] DeleteRequest request)
    {
        try
        {
            _service.Delete(request);
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
