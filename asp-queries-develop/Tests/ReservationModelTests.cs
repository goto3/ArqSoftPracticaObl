using asp_queries.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace Tests;

[ExcludeFromCodeCoverage]
[TestClass]
public class ReservationModelTests
{

    [TestMethod]
    public async Task OK()
    {
        var jsonString = "{  \"id\": 10,  \"organization\": \"newOrg1\",  \"bookId\": 10,  \"user\": \"user2@email.com\",  \"startDate\": \"2021-12-20\",  \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        var reservation = Reservation.CreateFromJSON(json);

        Assert.AreEqual(10, reservation.id);
        Assert.AreEqual("newOrg1", reservation.organization);
        Assert.AreEqual(10, reservation.bookId);
        Assert.AreEqual("user2@email.com", reservation.user);
        Assert.AreEqual(DateTime.Parse("2021-12-20"), reservation.startDate);
        Assert.AreEqual(DateTime.Parse("2021-12-22"), reservation.endDate);
    }

    [TestMethod]
    public async Task IdMissing()
    {
        var jsonString = "{   \"organization\": \"newOrg1\",  \"bookId\": 10,  \"user\": \"user2@email.com\",  \"startDate\": \"2021-12-20\",  \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'id' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task OrganizationMissing()
    {
        var jsonString = "{  \"id\": 10,   \"bookId\": 10,  \"user\": \"user2@email.com\",  \"startDate\": \"2021-12-20\",  \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'organization' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task BookIdMissing()
    {
        var jsonString = "{  \"id\": 10,  \"organization\": \"newOrg1\",   \"user\": \"user2@email.com\",  \"startDate\": \"2021-12-20\",  \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'bookId' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task UserMissing()
    {
        var jsonString = "{  \"id\": 10,  \"organization\": \"newOrg1\",  \"bookId\": 10,   \"startDate\": \"2021-12-20\",  \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'user' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task StartDateMissing()
    {
        var jsonString = "{  \"id\": 10,  \"organization\": \"newOrg1\",  \"bookId\": 10,  \"user\": \"user2@email.com\",   \"endDate\": \"2021-12-22\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'startDate' parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task EndDateMissing()
    {
        var jsonString = "{  \"id\": 10,  \"organization\": \"newOrg1\",  \"bookId\": 10,  \"user\": \"user2@email.com\",  \"startDate\": \"2021-12-20\"}";
        var json = JObject.Parse(jsonString);

        try
        {
            var reservation = Reservation.CreateFromJSON(json);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'endDate' parameter.", ex.Message);
        }
    }

}
