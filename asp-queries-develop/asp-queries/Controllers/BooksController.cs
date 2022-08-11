using asp_queries.BusinessLogic;
using asp_queries.Filters;
using asp_queries.Repository;
using Microsoft.AspNetCore.Mvc;

namespace asp_queries.Controllers;

[Route("api/queries/[controller]")]
[ApiController]
[TypeFilter(typeof(ExceptionFilter))]
public class BooksController : ControllerBase
{
    private readonly IBooksRepository _books;

    public BooksController(IBooksRepository books)
    {
        this._books = books;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks()
    {
        var headers = Request.Headers;
        string organization = headers["organization"];
        if (string.IsNullOrEmpty(organization)) throw new BusinessLogicException("Missing organization header", "ERR_GETBOOKS_ORGANIZATION_NULL_EMPTY");
        var result = await _books.GetTop5(organization.ToLower());
        return Ok(result);
    }
}

