using FluentMigrator;
using FluentMigrator.Runner;
using System.Diagnostics.CodeAnalysis;

namespace asp_queries;
[ExcludeFromCodeCoverage]
public static class Migrations
{
    public static void RunMigrations(WebApplication app)
    {
        using var serviceScope = app.Services.CreateScope();
        var services = serviceScope.ServiceProvider;
        var runner = services.GetRequiredService<IMigrationRunner>();
        try
        {
            if (Env.CLEARDB == "true") runner.MigrateDown(0);
            runner.MigrateUp(1);
        }
        catch { }
    }
}

[ExcludeFromCodeCoverage]
[Migration(1, "Initial")]
public class QueriesMigration : Migration
{
    public override void Up()
    {
        Create.Table("books")
            .WithColumn("id").AsInt32().NotNullable().PrimaryKey()
            .WithColumn("isbn").AsString().NotNullable()
            .WithColumn("organization").AsString().NotNullable()
            .WithColumn("title").AsString().NotNullable()
            .WithColumn("authors").AsString().NotNullable()
            .WithColumn("year").AsInt32().NotNullable()
            .WithColumn("copiesAmount").AsInt32().NotNullable()
            .WithColumn("reservations").AsInt32().NotNullable().WithDefaultValue(0);

        Create.Table("reservations")
            .WithColumn("id").AsInt32().NotNullable().PrimaryKey()
            .WithColumn("organization").AsString().NotNullable()
            .WithColumn("bookId").AsInt32().NotNullable()
            .WithColumn("user").AsString().NotNullable()
            .WithColumn("startDate").AsDate().NotNullable()
            .WithColumn("endDate").AsDate().NotNullable();
    }

    public override void Down()
    {
        try
        {
            Delete.Table("books");
        }
        catch { }
        try
        {
            Delete.Table("reservations");
        }
        catch { }
    }
}


