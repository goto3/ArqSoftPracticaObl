using asp_queries.BusinessLogic;
using asp_queries.Models;
using asp_queries.Repository;
using Newtonsoft.Json.Linq;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace asp_queries;
[ExcludeFromCodeCoverage]
public static class AmqpConnection
{
    public static void CreateConnection(BooksRepository booksRepo, ReservationsRepository reservationsRepo, string connectionString, string booksQueueName, string booksExchangeName, string reservationsQueueName, string reservationsExchangeName, ushort prefetchCount)
    {
        try
        {
            var factory = new ConnectionFactory() { Uri = new Uri(connectionString) };
            using var connection = factory.CreateConnection();
            using var channel = connection.CreateModel();

            // Books Channel queue
            channel.ExchangeDeclare(exchange: booksExchangeName, type: ExchangeType.Fanout, durable: true);
            channel.QueueDeclare(queue: booksQueueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
            channel.QueueBind(queue: booksQueueName, exchange: booksExchangeName, routingKey: "");
            channel.BasicQos(prefetchSize: 0, prefetchCount: prefetchCount, global: false);
            var bookConsumer = new EventingBasicConsumer(channel);
            bookConsumer.Received += async (sender, ea) => await ConsumeBookQueue(booksRepo, reservationsRepo, ea, channel);
            channel.BasicConsume(queue: booksQueueName, autoAck: false, consumer: bookConsumer);
            Console.WriteLine($"Connected to queue {booksQueueName}.");

            // Reservations channel queue
            channel.ExchangeDeclare(exchange: reservationsExchangeName, type: ExchangeType.Fanout, durable: true);
            channel.QueueDeclare(queue: reservationsQueueName, durable: true, exclusive: false, autoDelete: false, arguments: null);
            channel.QueueBind(queue: reservationsQueueName, exchange: reservationsExchangeName, routingKey: "");
            channel.BasicQos(prefetchSize: 0, prefetchCount: prefetchCount, global: false);
            var reservationConsumer = new EventingBasicConsumer(channel);
            reservationConsumer.Received += async (sender, ea) => await ConsumeReservationQueue(reservationsRepo, booksRepo, ea, channel);
            channel.BasicConsume(queue: reservationsQueueName, autoAck: false, consumer: reservationConsumer);
            Console.WriteLine($"Connected to queue {reservationsQueueName}.");

            Console.ReadLine();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception on queue, reconnecting... ", ex.ToString());
            Thread.Sleep(5000);
            CreateConnection(booksRepo, reservationsRepo, connectionString, booksQueueName, booksExchangeName, reservationsQueueName, reservationsExchangeName, prefetchCount);
        }
    }

    private static async Task ConsumeBookQueue(BooksRepository booksRepo, ReservationsRepository reservationsRepo, BasicDeliverEventArgs ea, IModel channel)
    {
        try
        {
            byte[] body = ea.Body.ToArray();
            var json = JObject.Parse(Encoding.UTF8.GetString(body));
            ValidateQueueMessage(json);

            var action = (string?)json["action"];
            switch (action)
            {
                case "CREATE":
                    var bookJsonCreate = json["data"] as JObject;
                    Book bookCreate = Book.CreateFromJSON(bookJsonCreate);
                    await booksRepo.InsertOne(bookCreate);
                    break;
                case "UPDATE":
                    var bookJsonUpdate = json["data"] as JObject;
                    Book bookUpdate = Book.CreateFromJSON(bookJsonUpdate);
                    await booksRepo.UpdateOne(bookUpdate);
                    break;
                case "DELETE":
                    var id = (string?)json["data"]?["id"];
                    if (string.IsNullOrEmpty(id)) throw new Exception("Malformed message.");
                    await booksRepo.DeleteOne(int.Parse(id));
                    await reservationsRepo.DeleteBookReservations(int.Parse(id));
                    break;
                default: throw new Exception("Malformed message.");
            }

            channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
        }
        catch (BusinessLogicException ex)
        {
            Console.WriteLine("BusinessLogicException: ", ex);
            Thread.Sleep(60000);
            channel.BasicNack(ea.DeliveryTag, false, true);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception: ", ex);
            Thread.Sleep(10000);
            channel.BasicNack(ea.DeliveryTag, false, true);
        }
    }

    private static async Task ConsumeReservationQueue(ReservationsRepository reservationsRepo, BooksRepository booksRepo, BasicDeliverEventArgs ea, IModel channel)
    {
        try
        {
            byte[] body = ea.Body.ToArray();
            var json = JObject.Parse(Encoding.UTF8.GetString(body));
            ValidateQueueMessage(json);

            var action = (string?)json["action"];
            switch (action)
            {
                case "CREATE":
                    var reservationJsonCreate = json["data"] as JObject;

                    Reservation reservationCreate = Reservation.CreateFromJSON(reservationJsonCreate);
                    await reservationsRepo.InsertOne(reservationCreate);
                    await booksRepo.IncrementReservation(reservationCreate.bookId);
                    break;
                case "UPDATE":
                    break;
                default: throw new Exception("Malformed message.");
            }

            channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
        }
        catch (BusinessLogicException ex)
        {
            Console.WriteLine("BusinessLogicException: ", ex);
            Thread.Sleep(60000);
            channel.BasicNack(ea.DeliveryTag, false, true);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Exception: ", ex);
            Thread.Sleep(10000);
            channel.BasicNack(ea.DeliveryTag, false, true);
        }
    }

    private static void ValidateQueueMessage(JObject json)
    {
        if (!json.ContainsKey("action")) throw new Exception("Malformed message.");
        if (!json.ContainsKey("data")) throw new Exception("Malformed message.");
    }
}

