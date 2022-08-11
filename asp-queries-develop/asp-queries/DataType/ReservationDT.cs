using asp_queries.Models;

namespace asp_queries.DataType;

public class ReservationDT
{

    public string? userEmail { get; set; }
    public DateTime? startDate { get; set; }
    public DateTime? endDate { get; set; }


    public ReservationDT(Reservation reservation)
    {
        this.userEmail = reservation.user;
        this.startDate = reservation.startDate;
        this.endDate = reservation.endDate;
    }

}
