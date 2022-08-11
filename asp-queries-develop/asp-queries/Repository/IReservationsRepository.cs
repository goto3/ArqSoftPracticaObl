using asp_queries.Models;

namespace asp_queries.Repository;

public interface IReservationsRepository
{
    Task DeleteBookReservations(int bookId);
    Task<List<Reservation>> GetReservationsByBookAndDate(string? organization, int bookId, DateTime from, DateTime to);
    Task InsertOne(Reservation reservation);
}
