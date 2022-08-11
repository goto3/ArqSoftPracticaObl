using asp_queries;
using asp_queries.Filters;
using asp_queries.Repository;
using FluentMigrator.Runner;

var amqpConnection = Env.AMQP_CONNECTION;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var dbConnection = $"Host={Env.DBHOST};Port={Env.DBPORT};Username={Env.DBUSER};Password={Env.DBPASSWORD};Database={Env.DBNAME}";
var booksRepository = new BooksRepository(dbConnection);
var reservationsRepository = new ReservationsRepository(dbConnection);

builder.Services.AddFluentMigratorCore()
    .ConfigureRunner(c => c
        .AddPostgres()
        .WithGlobalConnectionString($"server={Env.DBHOST};port={Env.DBPORT};Database={Env.DBNAME};UID={Env.DBUSER};PWD={Env.DBPASSWORD}")
        .ScanIn(typeof(QueriesMigration).Assembly).For.Migrations());

builder.Services.AddScoped<ExceptionFilter>();
builder.Services.AddControllers(config => config.Filters.Add(new ExceptionFilter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IBooksRepository>(_ => booksRepository);
builder.Services.AddScoped<IReservationsRepository>(_ => reservationsRepository);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseAuthorization();
app.MapControllers();

Migrations.RunMigrations(app);

var apiThread = new Thread(() => app.Run());
var queueThread = new Thread(() => AmqpConnection.CreateConnection(booksRepository, reservationsRepository, amqpConnection, Env.AMQP_BOOKS_QUEUE, Env.AMQP_BOOKS_EXCHANGE_NAME, Env.AMQP_RESERVATIONS_QUEUE, Env.AMQP_RESERVATIONS_EXCHANGE_NAME, Convert.ToUInt16(Env.AMQP_PREFETCH_COUNT)));

apiThread.Start();
queueThread.Start();
