using asp_queries.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace Tests;

[ExcludeFromCodeCoverage]
[TestClass]
public class BookModelTests
{

    [TestMethod]
    public async Task OK()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",  \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        var book = Book.CreateFromJSON(json);

        Assert.AreEqual(11, book.id);
        Assert.AreEqual("1234567890128", book.isbn);
        Assert.AreEqual("newOrg1", book.organization);
        Assert.AreEqual("Harry Potter and the Philosopher's Stone", book.title);
        Assert.AreEqual("J. K. Rowling", book.authors);
        Assert.AreEqual(1997, book.year);
        Assert.AreEqual(3, book.copiesAmount);
        Assert.AreEqual(0, book.reservations);
    }

    [TestMethod]
    public async Task IdMissing()
    {
        var jsonString = "{   \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",  \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        try
        {
            var book = Book.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'id' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task IsbnMissing()
    {
        var jsonString = "{  \"id\": 11,   \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",  \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        try
        {
            var book = Book.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'isbn' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task OrganizationMissing()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",   \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",  \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        try
        {
            var book = Book.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'organization' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task TitleMissing()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",   \"authors\": \"J. K. Rowling\",  \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        try
        {
            var book = Book.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'title' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task AuthorsMissing()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",   \"year\": 1997,  \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        var book = Book.CreateFromJSON(json);

        Assert.AreEqual(11, book.id);
        Assert.AreEqual("1234567890128", book.isbn);
        Assert.AreEqual("newOrg1", book.organization);
        Assert.AreEqual("Harry Potter and the Philosopher's Stone", book.title);
        Assert.AreEqual("", book.authors);
        Assert.AreEqual(1997, book.year);
        Assert.AreEqual(3, book.copiesAmount);
        Assert.AreEqual(0, book.reservations);
    }

    [TestMethod]
    public async Task YearMissing()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",   \"copiesAmount\": 3}";
        var json = JObject.Parse(jsonString);

        var book = Book.CreateFromJSON(json);

        Assert.AreEqual(11, book.id);
        Assert.AreEqual("1234567890128", book.isbn);
        Assert.AreEqual("newOrg1", book.organization);
        Assert.AreEqual("Harry Potter and the Philosopher's Stone", book.title);
        Assert.AreEqual("J. K. Rowling", book.authors);
        Assert.AreEqual(0, book.year);
        Assert.AreEqual(3, book.copiesAmount);
        Assert.AreEqual(0, book.reservations);
    }

    [TestMethod]
    public async Task CopiesMissing()
    {
        var jsonString = "{  \"id\": 11,  \"isbn\": \"1234567890128\",  \"organization\": \"newOrg1\",  \"title\": \"Harry Potter and the Philosopher's Stone\",  \"authors\": \"J. K. Rowling\",  \"year\": 1997,  }";
        var json = JObject.Parse(jsonString);

        try
        {
            var book = Book.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'copiesAmount' parameter.", ex.Message);
        }
    }



}
