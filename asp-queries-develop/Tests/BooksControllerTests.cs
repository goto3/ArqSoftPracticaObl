using asp_queries.Controllers;
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
public class BooksControllerTests
{

    [TestMethod]
    public async Task OK()
    {
        var id = 1;
        var isbn = "1234567890123";
        var organization = "organizationName";
        var title = "book title";
        var authors = "book authors";
        var year = 1999;
        var copies = 9;
        var reservations = 10;

        var dbOpResult = new List<Book>();
        dbOpResult.Add(new Book(id, "1234567890123", organization, title, authors, year, copies, reservations));

        var m_bookRepo = new Mock<IBooksRepository>(MockBehavior.Strict);
        m_bookRepo.Setup(m => m.GetTop5(organization.ToLower())).ReturnsAsync(() => dbOpResult);

        var controller = new BooksController(m_bookRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        var res = await controller.GetBooks();
        var okResult = res as ObjectResult;
        var statusCode = okResult?.StatusCode;
        var model = okResult?.Value as List<Book>;


        m_bookRepo.VerifyAll();
        Assert.AreEqual(200, statusCode);
        Assert.AreEqual(dbOpResult.Count, model?.Count);
        Assert.IsTrue(model?.Exists(a => a.id == id && a.isbn == isbn && a.organization == organization && a.title == title && a.authors == authors && a.year == year && a.copiesAmount == copies && a.reservations == reservations));
    }

    [TestMethod]
    public async Task MissingOrganizationParameter()
    {
        var organization = "";

        var m_resRepo = new Mock<IBooksRepository>(MockBehavior.Strict);
        var controller = new BooksController(m_resRepo.Object);
        controller.ControllerContext.HttpContext = new DefaultHttpContext();
        controller.ControllerContext.HttpContext.Request.Headers["organization"] = organization;

        try
        {
            var res = await controller.GetBooks();
            Assert.Fail();
        }
        catch (Exception ex)
        {
            Assert.AreEqual("Missing organization header", ex.Message);
        }
    }
}
