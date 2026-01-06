using HotelReservation.Api.Data;
using HotelReservation.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace HotelReservation.Api.Services
{
    public class CheckoutReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CheckoutReminderService> _logger;

        public CheckoutReminderService(IServiceProvider serviceProvider, ILogger<CheckoutReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("CheckoutReminderService is starting.");

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Checking for upcoming checkouts...");

                    try
                    {
                        using (var scope = _serviceProvider.CreateScope())
                        {
                            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                            var tomorrow = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
                            
                            var checkingOutTomorrow = await context.Reservations
                                .Include(r => r.Hotel)
                                .Where(r => r.CheckOutDate == tomorrow && r.Status == "CheckedIn") 
                                .ToListAsync(stoppingToken);

                            foreach (var res in checkingOutTomorrow)
                            {
                                
                                bool alreadyNotified = await context.Notifications.AnyAsync(n => 
                                    n.UserId == res.UserId && 
                                    n.Message.Contains("checkout") && 
                                    n.CreatedAt > DateTime.UtcNow.AddHours(-20), stoppingToken);

                                if (!alreadyNotified)
                                {
                                    context.Notifications.Add(new Notification
                                    {
                                        UserId = res.UserId,
                                        Message = $"Reminder: Your checkout at {res.Hotel.HotelName} is scheduled for tomorrow ({res.CheckOutDate:dd MMM}).",
                                        Type = "Warning"
                                    });
                                }
                            }

                            await context.SaveChangesAsync(stoppingToken);
                        }
                    }
                    catch (OperationCanceledException)
                    {
                        throw;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in CheckoutReminderService");
                    }
                    await Task.Delay(TimeSpan.FromHours(6), stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("CheckoutReminderService is stopping.");
            }
        }
    }
}
