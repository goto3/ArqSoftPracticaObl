using asp_queries.BusinessLogic;
using asp_queries.DataType;
using asp_queries.Filters;
using asp_queries.Repository;
using Microsoft.AspNetCore.Mvc;

namespace asp_queries.Controllers;

[Route("api/queries/[controller]")]
[ApiController]
[TypeFilter(typeof(ExceptionFilter))]
public class ReservationsController : ControllerBase
{
    private readonly IReservationsRepository _reservations;

    public ReservationsController(IReservationsRepository reservations)
    {
        this._reservations = reservations;
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations([FromQuery] int bookId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var headers = Request.Headers;
        string organization = headers["organization"];
        if (string.IsNullOrEmpty(organization)) throw new BusinessLogicException("Missing organization header", "ERR_GETRESERVATIONS_ORGANIZATION_NULL_EMPTY");
        ReservationLogic.ValidateQueryParameters(organization.ToLower(), bookId, startDate, endDate);
        var reservations = await _reservations.GetReservationsByBookAndDate(organization.ToLower(), bookId, startDate, endDate);
        var result = new List<ReservationDT>();
        reservations.ForEach((r) => result.Add(new ReservationDT(r)));
        return Ok(result);
    }
}

