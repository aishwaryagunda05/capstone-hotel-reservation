using HotelReservation.Api.Models;

namespace HotelReservation.Api.Data
{
    public static class DbSeeder
    {
        public static void Seed(AppDbContext context)
        {
            // 1. Seed Admin
            if (!context.Users.Any(u => u.Role == "Admin"))
            {
                var admin = new User
                {
                    FullName = "System Admin",
                    Email = "admin@hotel.com",
                    Role = "Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
                };
                context.Users.Add(admin);
                context.SaveChanges();
            }

            // 2. Seed Hotel
            if (!context.Hotels.Any())
            {
                var hotel = new Hotel
                {
                    HotelName = "Grand Hotel",
                    Address = "123 Main St",
                    City = "Metropolis",
                    Phone = "555-0199",
                    Email = "grand@hotel.com"
                };
                context.Hotels.Add(hotel);
                context.SaveChanges();
            }

            // 3. Seed Manager
            if (!context.Users.Any(u => u.Role == "Manager"))
            {
                context.RoomTypes.AddRange(new List<RoomType>
                {
                    new RoomType { RoomTypeName = "Deluxe", BasePrice = 5000 },
                    new RoomType { RoomTypeName = "Suite", BasePrice = 12000 },
                    new RoomType { RoomTypeName = "Non-AC", BasePrice = 3000 }
                });

                var manager = new User
                {
                    FullName = "Default Manager",
                    Email = "manager@hotel.com",
                    Role = "Manager",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager@123")
                };
                context.Users.Add(manager);
                context.SaveChanges();
            }
            var standardType = context.RoomTypes.FirstOrDefault(rt => rt.RoomTypeName == "Standard");
            if (standardType != null)
            {
                standardType.RoomTypeName = "Non-AC";
                context.SaveChanges();
            }

            // 4. Seed Assignment
            var managerUser = context.Users.FirstOrDefault(u => u.Email == "manager@hotel.com");
            var defaultHotel = context.Hotels.FirstOrDefault(h => h.Email == "grand@hotel.com");

            if (managerUser != null && defaultHotel != null)
            {
                if (!context.UserHotelAssignments.Any(a => a.UserId == managerUser.UserId && a.HotelId == defaultHotel.HotelId))
                {
                    context.UserHotelAssignments.Add(new UserHotelAssignment
                    {
                        UserId = managerUser.UserId,
                        HotelId = defaultHotel.HotelId,
                        IsActive = true
                    });
                    context.SaveChanges();
                }
            }

            // 5. Seed Rooms for All Hotels (Ensure every hotel has inventory)
            var allHotels = context.Hotels.ToList();
            var allRoomTypes = context.RoomTypes.ToList();

            if (allHotels.Any() && allRoomTypes.Any())
            {
                foreach (var h in allHotels)
                {
                    // If hotel has no rooms, add default inventory
                    if (!context.Rooms.Any(r => r.HotelId == h.HotelId))
                    {
                        var rooms = new List<Room>();

                        // Add 5 Deluxe Rooms
                        var deluxe = allRoomTypes.FirstOrDefault(rt => rt.RoomTypeName == "Deluxe");
                        if (deluxe != null)
                        {
                            for (int i = 1; i <= 5; i++)
                            {
                                rooms.Add(new Room { RoomNumber = $"10{i}", RoomTypeId = deluxe.RoomTypeId, HotelId = h.HotelId });
                            }
                        }

                        // Add 3 Non-AC Rooms
                        var nonAc = allRoomTypes.FirstOrDefault(rt => rt.RoomTypeName == "Non-AC");
                        if (nonAc != null)
                        {
                            for (int i = 1; i <= 3; i++)
                            {
                                rooms.Add(new Room { RoomNumber = $"20{i}", RoomTypeId = nonAc.RoomTypeId, HotelId = h.HotelId });
                            }
                        }

                        // Add 2 Suites
                        var suite = allRoomTypes.FirstOrDefault(rt => rt.RoomTypeName == "Suite");
                        if (suite != null)
                        {
                            for (int i = 1; i <= 2; i++)
                            {
                                rooms.Add(new Room { RoomNumber = $"30{i}", RoomTypeId = suite.RoomTypeId, HotelId = h.HotelId });
                            }
                        }

                        context.Rooms.AddRange(rooms);
                    }
                }
                context.SaveChanges();
            }
        }
    }
}
