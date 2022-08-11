using asp_queries.Controllers;
using asp_queries.DataType;
using asp_queries.Models;
using asp_queries.Repository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;

namespace Tests;

[ExcludeFromCodeCoverage]
[TestClass]
public class ReservationsControllerTests
{

    [TestMethod]
    public async Task OK()
    {
        var organization = "organizationName";
        var bookId = 1;
        var startDate = DateTime.Now;
        var endDate = DateTime.Now.AddDays(2);

        var dbOpResult = new List<Reservation>();
        dbOpResult.Add(new Reservation("user1", startDate, endDate));

        var m_resRepo = new Mock<IReservationsRepository>(MockBehavior.Strict);
        m_resRepo.Setup(m => m.GetReservationsByBookAndDate(organization.ToLower(), bookId, startDate, endDate)).ReturnsAsync(() => dbOpResult);

        var controller = new ReservationsController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        var res = await controller.GetReservations(bookId, startDate, endDate);
        var okResult = res as ObjectResult;
        var statusCode = okResult?.StatusCode;
        var model = okResult?.Value as List<ReservationDT>;

        m_resRepo.VerifyAll();
        Assert.AreEqual(200, statusCode);
        Assert.AreEqual(dbOpResult.Count, model?.Count);
        Assert.IsTrue(model?.Exists(a => a.userEmail == "user1" && a.startDate == startDate && a.endDate == endDate));
    }

    [TestMethod]
    public async Task MissingOrganizationParameter()
    {
        var organization = "";
        var bookId = 1;

        var m_resRepo = new Mock<IReservationsRepository>(MockBehavior.Strict);
        var controller = new ReservationsController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        try
        {
            var res = await controller.GetReservations(bookId, DateTime.MinValue, DateTime.MinValue);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing organization header", ex.Message);
        }
    }

    [TestMethod]
    public async Task MissingStartDateParameter()
    {
        var organization = "organization";
        var bookId = 1;

        var m_resRepo = new Mock<IReservationsRepository>(MockBehavior.Strict);
        var controller = new ReservationsController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        try
        {
            var res = await controller.GetReservations(bookId, DateTime.MinValue, DateTime.MinValue);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'startDate' query parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task MissingEndDateParameter()
    {
        var organization = "organization";
        var startDate = DateTime.Now;
        var bookId = 1;

        var m_resRepo = new Mock<IReservationsRepository>(MockBehavior.Strict);
        var controller = new ReservationsController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        try
        {
            var res = await controller.GetReservations(bookId, startDate, DateTime.MinValue);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing 'endDate' query parameter.", ex.Message);
        }
    }

    [TestMethod]
    public async Task DatesInvalid()
    {
        var organization = "organization";
        var startDate = DateTime.Now.AddDays(1);
        var endDate = DateTime.Now;
        var bookId = 1;

        var m_resRepo = new Mock<IReservationsRepository>(MockBehavior.Strict);
        var controller = new ReservationsController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        try
        {
            var res = await controller.GetReservations(bookId, startDate, endDate);
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Query parameter 'startDate' should be before 'endDate'.", ex.Message);
        }
    }

}
