using asp_queries.BusinessLogic;
using Newtonsoft.Json.Linq;

namespace asp_queries.Models;
public class Reservation
{
    public int id { get; set; }
    public string? organization { get; set; }
    public int bookId { get; set; }
    public string? user { get; set; }
    public DateTime startDate { get; set; }
    public DateTime endDate { get; set; }

    public Reservation(string user, DateTime startDate, DateTime endDate)
    {
        this.user = user;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Reservation(int id, string organization, int bookId, string user, DateTime startDate, DateTime endDate)
    {
        this.id = id;
        this.organization = organization;
        this.bookId = bookId;
        this.user = user;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public static Reservation CreateFromJSON(JObject json)
    {
        var idToken = json.GetValue("id");
        var organizationToken = json.GetValue("organization");
        var bookIdToken = json.GetValue("bookId");
        var userToken = json.GetValue("user");
        var startDateToken = json.GetValue("startDate");
        var endDateToken = json.GetValue("endDate");

        int id = (idToken != null) ? ((int)idToken) : 0;
        string organization = (organizationToken != null) ? (organizationToken.ToString()) : "";
        int bookId = (bookIdToken != null) ? ((int)bookIdToken) : 0;
        string user = (userToken != null) ? (userToken.ToString()) : "";
        DateTime startDate = (startDateToken != null) ? (((DateTime)startDateToken)) : DateTime.MinValue;
        DateTime endDate = (endDateToken != null) ? ((DateTime)endDateToken) : DateTime.MinValue;

        if (id == 0) throw new BusinessLogicException("Missing 'id' parameter.", "ERR_RESERVATION_QUEUE_ID_MISSING");
        if (bookId == 0) throw new BusinessLogicException("Missing 'bookId' parameter.", "ERR_RESERVATION_QUEUE_BOOKID_NULL_EMPTY");
        if (string.IsNullOrEmpty(organization)) throw new BusinessLogicException("Missing 'organization' parameter.", "ERR_RESERVATION_QUEUE_ORGANIZATION_NULL_EMPTY");
        if (string.IsNullOrEmpty(user)) throw new BusinessLogicException("Missing 'user' parameter.", "ERR_RESERVATION_QUEUE_USER_NULL_EMPTY");
        if (startDate == DateTime.MinValue) throw new BusinessLogicException("Missing 'startDate' parameter.", "ERR_RESERVATION_QUEUE_STARTDATE_MISSING");
        if (endDate == DateTime.MinValue) throw new BusinessLogicException("Missing 'endDate' parameter.", "ERR_RESERVATION_QUEUE_ENDDATE_MISSING");

        return new Reservation(id, organization, bookId, user, startDate, endDate);
    }
}

