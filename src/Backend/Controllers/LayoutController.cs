using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/layout")]
public sealed class LayoutController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public LayoutController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpPut]
    public IActionResult Save([FromQuery] string? path, [FromBody] SaveLayoutRequest request)
    {
        try
        {
            _service.SaveLayout(path, request);
            return NoContent();
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
}
