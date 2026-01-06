using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace HotelReservation.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Hotel> Hotels { get; set; }
        public DbSet<UserHotelAssignment> UserHotelAssignments { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<SeasonalPrice> SeasonalPrices { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationRoom> ReservationRooms { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ServiceRequest> ServiceRequests { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserHotelAssignment>()
         .HasOne(x => x.User)
         .WithMany(u => u.HotelAssignments)
         .HasForeignKey(x => x.UserId)
         .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserHotelAssignment>()
                .HasOne(x => x.Hotel)
                .WithMany(h => h.UserAssignments)
                .HasForeignKey(x => x.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserHotelAssignment>()
                .HasIndex(x => new { x.UserId, x.HotelId })
                .IsUnique();

            // ROOMTYPE PRICE PRECISION
            modelBuilder.Entity<RoomType>()
                .Property(r => r.BasePrice)
                .HasPrecision(10, 2);
            // 🔹 Reservation → User
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔹 Reservation → Hotel
            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Hotel)
                .WithMany()
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔹 ReservationRoom → Reservation
            modelBuilder.Entity<ReservationRoom>()
                .HasOne(rr => rr.Reservation)
                .WithMany(r => r.ReservationRooms)
                .HasForeignKey(rr => rr.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);

            // 🔹 ReservationRoom → Room
            modelBuilder.Entity<ReservationRoom>()
                .HasOne(rr => rr.Room)
                .WithMany()
                .HasForeignKey(rr => rr.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<ReservationRoom>()
            .Property(r => r.PricePerNight)
            .HasPrecision(10, 2);

            modelBuilder.Entity<ReservationRoom>()
                .Property(r => r.TotalAmount)
                .HasPrecision(12, 2);

            // UNIQUE ROOM PER HOTEL
            modelBuilder.Entity<Room>()
                .HasIndex(r => new { r.HotelId, r.RoomNumber })
                .IsUnique();

            // DEFAULTS
            modelBuilder.Entity<Room>()
                .Property(r => r.Status)
                .HasDefaultValue("Available");

            modelBuilder.Entity<Room>()
                .Property(r => r.IsActive)
                .HasDefaultValue(true);


            // DateOnly mapping (NO converters needed)
            modelBuilder.Entity<SeasonalPrice>()
                .Property(x => x.StartDate)
                .HasColumnType("date");

            modelBuilder.Entity<SeasonalPrice>()
                .Property(x => x.EndDate)
                .HasColumnType("date");
 
            modelBuilder.Entity<Reservation>()
                .Property(x => x.CheckInDate)
                .HasColumnType("date");
 
            modelBuilder.Entity<Reservation>()
                .Property(x => x.CheckOutDate)
                .HasColumnType("date");

            modelBuilder.Entity<Reservation>()
                .Property(r => r.BreakageFee)
                .HasPrecision(10, 2);

        }
    }
}
