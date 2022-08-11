using System.Diagnostics.CodeAnalysis;

namespace asp_queries;

[ExcludeFromCodeCoverage]
public static class Env
{
    public static string CLEARDB { get; private set; } = Environment.GetEnvironmentVariable("CLEARDB") ?? "false";
    public static string DBHOST { get; private set; } = Environment.GetEnvironmentVariable("DBHOST") ?? "localhost";
    public static string DBPORT { get; private set; } = Environment.GetEnvironmentVariable("DBPORT") ?? "5432";
    public static string DBNAME { get; private set; } = Environment.GetEnvironmentVariable("DBNAME") ?? "asp-queries";
    public static string DBUSER { get; private set; } = Environment.GetEnvironmentVariable("DBUSER") ?? "postgres";
    public static string DBPASSWORD { get; private set; } = Environment.GetEnvironmentVariable("DBPASSWORD") ?? "admin";
    public static string AMQP_CONNECTION { get; private set; } = Environment.GetEnvironmentVariable("AMQP_CONNECTION") ?? "amqp://rabbitmq:admin@rabbitmq-books:5672";
    public static string AMQP_BOOKS_QUEUE { get; private set; } = Environment.GetEnvironmentVariable("AMQP_BOOKS_QUEUE") ?? "books_queue";
    public static string AMQP_BOOKS_EXCHANGE_NAME { get; private set; } = Environment.GetEnvironmentVariable("AMQP_BOOKS_EXCHANGE_NAME") ?? "asp-books";
    public static string AMQP_RESERVATIONS_QUEUE { get; private set; } = Environment.GetEnvironmentVariable("AMQP_RESERVATIONS_QUEUE") ?? "reservations_queue";
    public static string AMQP_RESERVATIONS_EXCHANGE_NAME { get; private set; } = Environment.GetEnvironmentVariable("AMQP_RESERVATIONS_EXCHANGE_NAME") ?? "asp-reservations";
    public static string AMQP_PREFETCH_COUNT { get; private set; } = Environment.GetEnvironmentVariable("AMQP_PREFETCH_COUNT") ?? "20";
}


