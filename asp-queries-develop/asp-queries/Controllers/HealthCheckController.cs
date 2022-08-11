using asp_queries.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;

namespace asp_queries.Controllers;

[Route("api/[controller]")]
[ApiController]
[TypeFilter(typeof(ExceptionFilter))]
[ExcludeFromCodeCoverage]
public class HealthCheckController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }

}



