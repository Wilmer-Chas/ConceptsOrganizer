using Backend.Dto;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[ApiController]
[Route("api/search")]
public sealed class SearchController : ControllerBase
{
    private readonly IKnowledgeService _service;

    public SearchController(IKnowledgeService service)
    {
        _service = service;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<SearchHitDto>> Search([FromQuery] string q)
    {
        return Ok(_service.Search(q ?? string.Empty));
    }
}
