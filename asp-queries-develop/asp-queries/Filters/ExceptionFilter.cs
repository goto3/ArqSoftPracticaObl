using asp_queries.BusinessLogic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Diagnostics.CodeAnalysis;

namespace asp_queries.Filters;
[ExcludeFromCodeCoverage]
public class ExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var error = ParseException(context.Exception);

        HttpResponse response = context.HttpContext.Response;
        response.StatusCode = error.StatusCode;
        response.ContentType = "application/json";
        context.Result = new ObjectResult(error);
    }

    private static ApiException ParseException(Exception ex)
    {
        var StatusCode = 500;
        var ErrorCode = "GENERIC_SERVERERROR";
        var Message = "An error occurred processing the request.";
        var Details = ex.Message;

        if (ex is BusinessLogicException)
        {
            var ble = ex as BusinessLogicException;
            StatusCode = 400;
            ErrorCode = ble?.Code;
            Details = ble?.Message;
        }

        return new ApiException() { StatusCode = StatusCode, ErrorCode = ErrorCode, Message = Message, Details = Details };
    }

    internal record ApiException
    {
        public int StatusCode { get; set; }
        public string? ErrorCode { get; set; }
        public string? Message { get; set; }
        public string? Details { get; set; }
    }
}



