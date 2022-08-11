using asp_queries.Models;
using Dapper;
using Npgsql;
using System.Diagnostics.CodeAnalysis;

namespace asp_queries.Repository;
[ExcludeFromCodeCoverage]
public class BooksRepository : IBooksRepository
{
    const string SQL_INSERT = "INSERT INTO books (id, isbn, organization, title, authors, year, \"copiesAmount\") VALUES (@id,@isbn,@organization,@title,@authors,@year,@copiesAmount)";
    const string SQL_UPDATE = "UPDATE books SET id = @id, isbn = @isbn, organization = @organization, title = @title, authors = @authors, year = @year, \"copiesAmount\" = @copiesAmount, reservations = 0 WHERE id = @id";
    const string SQL_DELETE = "DELETE FROM books WHERE id = @id";
    const string SQL_INCREMENTRESERVATIONS = "UPDATE books SET reservations = reservations + 1 WHERE id = @id";
    const string SQL_TOP5 = "SELECT * FROM books WHERE Organization = (@org) ORDER BY reservations desc LIMIT 5";

    private readonly string _dbConnection;
    public BooksRepository(string connectionString) => _dbConnection = connectionString;

    public async Task InsertOne(Book book)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { book.id, book.isbn, book.organization, book.title, book.authors, book.year, book.copiesAmount };
        try
        {
            await _db.ExecuteAsync(SQL_INSERT, values).ConfigureAwait(false);
        }
        catch (PostgresException ex)
        {
            throw ex;
        }
    }

    public async Task UpdateOne(Book book)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { book.id, book.isbn, book.organization, book.title, book.authors, book.year, book.copiesAmount };
        try
        {
            await _db.ExecuteAsync(SQL_UPDATE, values).ConfigureAwait(false);
        }
        catch (PostgresException ex)
        {
            throw ex;
        }
    }

    public async Task DeleteOne(int id)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { id };
        try
        {
            await _db.ExecuteAsync(SQL_DELETE, values).ConfigureAwait(false);
        }
        catch (PostgresException ex)
        {
            throw ex;
        }
    }

    public async Task IncrementReservation(int bookId)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { id = bookId };
        try
        {
            await _db.ExecuteAsync(SQL_INCREMENTRESERVATIONS, values).ConfigureAwait(false);
        }
        catch (PostgresException ex)
        {
            throw ex;
        }
    }

    public async Task<List<Book>> GetTop5(string? organization)
    {
        using var _db = new NpgsqlConnection(_dbConnection);
        var values = new { org = organization };
        var orderDetails = await _db.QueryAsync<Book>(SQL_TOP5, values).ConfigureAwait(false);
        return orderDetails.ToList();
    }
}

