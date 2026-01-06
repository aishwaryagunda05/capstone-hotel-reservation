using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace HotelReservation.Api.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                context.Response.ContentType = "application/json";
                var statusCode = (int)HttpStatusCode.InternalServerError;
                var message = "An unexpected error occurred.";
                var details = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null;
                if (ex is DbUpdateException dbEx)
                {
                    var sqlEx = dbEx.InnerException as SqlException;

                    if (sqlEx != null && sqlEx.Number == 547) 
                    {
                        statusCode = (int)HttpStatusCode.BadRequest;
                        message = "The related record does not exist. Please check your inputs (e.g., HotelId, RoomTypeId).";
                    }
                    else if (sqlEx != null && (sqlEx.Number == 2601 || sqlEx.Number == 2627)) 
                    {
                        statusCode = (int)HttpStatusCode.Conflict;
                        message = "A record with this key already exists.";
                    }
                    else
                    {
                        message = dbEx.GetBaseException().Message;
                    }
                }
                else
                {
                    message = _env.IsDevelopment() ? ex.Message : "Internal Server Error";
                }

                context.Response.StatusCode = statusCode;

                var response = new ApiErrorResponse(statusCode, message, details);

                var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = JsonSerializer.Serialize(response, options);

                await context.Response.WriteAsync(json);
            }
        }
    }
    public class ApiErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string? Details { get; set; }

        public ApiErrorResponse(int statusCode, string message, string? details = null)
        {
            StatusCode = statusCode;
            Message = message;
            Details = details;
        }
    }
}
