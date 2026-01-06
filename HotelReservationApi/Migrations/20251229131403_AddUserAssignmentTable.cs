using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelReservationApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAssignmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserHotelAssignments_UserId",
                table: "UserHotelAssignments");

            migrationBuilder.DropColumn(
                name: "FromTime",
                table: "UserHotelAssignments");

            migrationBuilder.DropColumn(
                name: "ShiftType",
                table: "UserHotelAssignments");

            migrationBuilder.DropColumn(
                name: "ToTime",
                table: "UserHotelAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_UserHotelAssignments_UserId_HotelId",
                table: "UserHotelAssignments",
                columns: new[] { "UserId", "HotelId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserHotelAssignments_UserId_HotelId",
                table: "UserHotelAssignments");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "FromTime",
                table: "UserHotelAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "ShiftType",
                table: "UserHotelAssignments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ToTime",
                table: "UserHotelAssignments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.CreateIndex(
                name: "IX_UserHotelAssignments_UserId",
                table: "UserHotelAssignments",
                column: "UserId");
        }
    }
}
