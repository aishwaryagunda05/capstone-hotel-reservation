namespace HotelReservation.Api.DTOs
{
    public class CreateWalkInReservationDto : CreateReservationDto
    {
        public int GuestUserId { get; set; }
    }
}
