using FluentAssertions;
using HotelReservation.Api.Controllers;
using HotelReservation.Api.Data;
using HotelReservation.Api.DTOs;
using HotelReservation.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace HotelReservation.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly AppDbContext _context;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new AppDbContext(options);
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.Setup(c => c["Jwt:Key"]).Returns("ThisIsASecretKeyForTestingPurposeOnly12345");
            _mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
            _mockConfig.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

            _controller = new AuthController(_context, _mockConfig.Object);
        }

        [Fact]
        public async Task Register_ShouldReturnOk_WhenEmailIsUnique()
        {
            var dto = new RegisterDto
            {
                FullName = "Test User",
                Email = "test@example.com",
                Password = "Password123",
                Phone = "1234567890"
            };
            var result = await _controller.Register(dto);

            result.Should().BeOfType<OkObjectResult>();
            if (result is OkObjectResult okResult)
            {
                var val = okResult.Value;
                Assert.NotNull(val);
                val.Should().BeEquivalentTo(new
                {
                    success = true,
                    message = "Guest registered successfully",
                    data = new { userId = 1, fullName = "Test User", email = "test@example.com", role = "Guest" }
                });
            }
            else
            {
                Assert.Fail("Result is not OkObjectResult");
            }

            _context.Users.Should().ContainSingle(u => u.Email == "test@example.com");
        }

        [Fact]
        public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
        {
            _context.Users.Add(new User { Email = "existing@example.com", FullName = "Existing", PasswordHash = "hash", Role = "Guest" });
            await _context.SaveChangesAsync();

            var dto = new RegisterDto
            {
                FullName = "New User",
                Email = "existing@example.com",
                Password = "Password123",
                Phone = "0987654321"
            };

            var result = await _controller.Register(dto);
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
        {
            var password = "Password123";
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            _context.Users.Add(new User { Email = "user@example.com", FullName = "User", PasswordHash = hash, Role = "Guest" });
            await _context.SaveChangesAsync();

            var dto = new LoginDto { Email = "user@example.com", Password = password };
            var result = await _controller.Login(dto);
            result.Should().BeOfType<OkObjectResult>();
            if (result is OkObjectResult okResult)
            {
                var resultVal = okResult.Value;
                Assert.NotNull(resultVal);
                var json = System.Text.Json.JsonSerializer.Serialize(resultVal);
                json.Should().Contain("token");
            }
            else
            {
                 Assert.Fail("Result is not OkObjectResult");
            }
        }

        [Theory]
        [InlineData("wrong@example.com", "Password123")]
        [InlineData("user@example.com", "WrongPassword")] 
        public async Task Login_ShouldReturnUnauthorized_WhenCredentialsAreInvalid(string email, string password)
        {
            var validPassword = "Password123";
            var hash = BCrypt.Net.BCrypt.HashPassword(validPassword);
            
            if (!_context.Users.Any(u => u.Email == "user@example.com"))
            {
                _context.Users.Add(new User { Email = "user@example.com", FullName = "User", PasswordHash = hash, Role = "Guest" });
                await _context.SaveChangesAsync();
            }

            var dto = new LoginDto { Email = email, Password = password };
            var result = await _controller.Login(dto);
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }
    }
}
