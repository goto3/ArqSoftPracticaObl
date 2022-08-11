using asp_queries.BusinessLogic;
using Newtonsoft.Json.Linq;

namespace asp_queries.Models;

public class Book
{
    public int id { get; set; }
    public string isbn { get; set; }
    public string organization { get; set; }
    public string title { get; set; }
    public string authors { get; set; }
    public int year { get; set; }
    public int copiesAmount { get; set; }
    public int reservations { get; set; }

    public Book(int id, string isbn, string organization, string title, string authors, int year, int copiesAmount, int reservations)
    {
        this.id = id;
        this.isbn = isbn;
        this.organization = organization;
        this.title = title;
        this.authors = authors;
        this.year = year;
        this.copiesAmount = copiesAmount;
        this.reservations = reservations;
    }

    public static Book CreateFromJSON(JObject json)
    {
        var idToken = json.GetValue("id");
        var isbnToken = json.GetValue("isbn");
        var organizationToken = json.GetValue("organization");
        var titleToken = json.GetValue("title");
        var authorsToken = json.GetValue("authors");
        var yearToken = json.GetValue("year");
        var copiesAmountToken = json.GetValue("copiesAmount");

        int id = (idToken != null) ? ((int)idToken) : 0;
        string isbn = (isbnToken != null) ? (isbnToken.ToString()) : "";
        string organization = (organizationToken != null) ? (organizationToken.ToString()) : "";
        string title = (titleToken != null) ? (titleToken.ToString()) : "";
        string authors = (authorsToken != null) ? authorsToken.ToString() : "";
        int year = (yearToken != null) ? ((int)yearToken) : 0;
        int copiesAmount = (copiesAmountToken != null) ? ((int)copiesAmountToken) : 0;

        if (id == 0) throw new BusinessLogicException("Missing 'id' parameter.", "ERR_BOOK_QUEUE_ID_MISSING");
        if (string.IsNullOrEmpty(isbn)) throw new BusinessLogicException("Missing 'isbn' parameter.", "ERR_BOOK_QUEUE_ISBN_NULL_EMPTY");
        if (string.IsNullOrEmpty(organization)) throw new BusinessLogicException("Missing 'organization' parameter.", "ERR_BOOK_QUEUE_ORGANIZATION_NULL_EMPTY");
        if (string.IsNullOrEmpty(title)) throw new BusinessLogicException("Missing 'title' parameter.", "ERR_BOOK_QUEUE_TITLE_NULL_EMPTY");
        if (copiesAmount == 0) throw new BusinessLogicException("Missing 'copiesAmount' parameter.", "ERR_BOOK_QUEUE_COPIESAMOUNT_MISSING");

        return new Book(id, isbn, organization, title, authors, year, copiesAmount, 0);
    }
}
