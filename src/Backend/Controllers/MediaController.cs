using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/media")]
public sealed class MediaController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public MediaController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpPost]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Upload([FromForm] string folderPath, IFormFile file)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { error = "File is required." });
        }

        try
        {
            await using var stream = file.OpenReadStream();
            var result = _service.UploadMedia(folderPath, file.FileName, stream);
            return Ok(result);
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

    [HttpGet]
    public IActionResult Get([FromQuery] string path)
    {
        try
        {
            var media = _service.GetMedia(path);
            if (media is null)
            {
                return NotFound();
            }

            return PhysicalFile(media.Value.AbsolutePath, media.Value.ContentType);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
