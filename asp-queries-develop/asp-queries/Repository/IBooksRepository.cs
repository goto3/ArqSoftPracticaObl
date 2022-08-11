using asp_queries.Models;

namespace asp_queries.Repository;

public interface IBooksRepository
{
    Task DeleteOne(int id);
    Task<List<Book>> GetTop5(string? organization);
    Task IncrementReservation(int bookId);
    Task InsertOne(Book book);
    Task UpdateOne(Book book);
}
