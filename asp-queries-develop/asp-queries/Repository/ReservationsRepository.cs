using asp_queries.Models;
using Dapper;
using Npgsql;
using System.Diagnostics.CodeAnalysis;

namespace asp_queries.Repository;

[ExcludeFromCodeCoverage]
public class ReservationsRepository : IReservationsRepository
{
    private const string SQL_INSERT = "INSERT INTO reservations (id, organization, \"bookId\", \"user\", \"startDate\", \"endDate\") VALUES (@id, @organization, @bookId, @user, @startDate, @endDate)";
    private const string SQL_QUERY2 = "SELECT R.user, \"startDate\", \"endDate\" FROM reservations AS R WHERE (organization = '{0}' AND \"bookId\" = '{1}' AND \"startDate\" <= '{3}' AND \"endDate\" >= '{2}')";
    private const string SQL_DELETEBOOKRESERVATIONS = "DELETE FROM reservations WHERE \"bookId\" = @bookId";

    private readonly string _dbConnection;
    public ReservationsRepository(string connectionString) => _dbConnection = connectionString;

    public async Task InsertOne(Reservation reservation)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { reservation.id, reservation.organization, reservation.bookId, reservation.user, reservation.startDate, reservation.endDate };
        try
        {
            await _db.ExecuteAsync(SQL_INSERT, values).ConfigureAwait(false);
        }
        catch (PostgresException ex)
        {
            throw ex;
        }
    }

    public async Task<List<Reservation>> GetReservationsByBookAndDate(string? organization, int bookId, DateTime from, DateTime to)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var startDate = from.ToString("yyyy-MM-dd");
        var endDate = to.ToString("yyyy-MM-dd");
        var queryWithValues = string.Format(SQL_QUERY2, organization, bookId, startDate, endDate);
        var reservations = await _db.QueryAsync<Reservation>(queryWithValues).ConfigureAwait(false);
        return reservations.ToList();
    }

    public async Task DeleteBookReservations(int bookId)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { bookId };
        var reservations = await _db.QueryAsync<Reservation>(SQL_DELETEBOOKRESERVATIONS, values).ConfigureAwait(false);
    }
}

