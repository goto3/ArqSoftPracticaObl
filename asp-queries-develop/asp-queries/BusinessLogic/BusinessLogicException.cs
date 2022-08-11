using System.Diagnostics.CodeAnalysis;

namespace asp_queries.BusinessLogic;

[ExcludeFromCodeCoverage]
public class BusinessLogicException : Exception
{
    public string? Code { get; set; }

    public BusinessLogicException() { }
    public BusinessLogicException(string msg) : base(msg) { }
    public BusinessLogicException(string msg, string code) : base(msg) { this.Code = code; }
}

