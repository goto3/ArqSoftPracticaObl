namespace asp_queries.BusinessLogic;

public static class ReservationLogic
{

    public static void ValidateQueryParameters(string? organization, int bookId, DateTime startDate, DateTime endDate)
    {
        if (startDate == DateTime.MinValue) throw new BusinessLogicException("Missing 'startDate' query parameter.", "ERR_QUERY2_STARTDATE_MISSING");
        if (endDate == DateTime.MinValue) throw new BusinessLogicException("Missing 'endDate' query parameter.", "ERR_QUERY2_ENDDATE_MISSING");
        if (startDate > endDate) throw new BusinessLogicException("Query parameter 'startDate' should be before 'endDate'.", "ERR_QUERY2_DATES_ORDER");
    }

}

