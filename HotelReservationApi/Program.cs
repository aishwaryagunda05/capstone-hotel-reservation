using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using HotelReservation.Api.Data;
using HotelReservation.Api.Repositories;
using HotelReservation.Api.Services;

using HotelReservation.Api.Middleware;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddScoped<UserHotelAssignmentRepository>();
builder.Services.AddScoped<UserHotelAssignmentService>();
builder.Services.AddScoped<ReservationRepository>();
builder.Services.AddScoped<ReservationService>();
builder.Services.AddScoped<ReservationApprovalRepository>();
builder.Services.AddScoped<ReservationApprovalService>();


builder.Services.AddScoped<RoomTypeService>();
builder.Services.AddScoped<RoomService>();
builder.Services.AddHostedService<CheckoutReminderService>();

// Refactored Services & Repositories
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<NotificationService>();

builder.Services.AddScoped<IServiceRequestRepository, ServiceRequestRepository>();
builder.Services.AddScoped<ServiceRequestService>();

builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<BillingService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "default_secret_key_for_development_purposes"))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbSeeder.Seed(db);
}


app.Run();

public partial class Program { }
