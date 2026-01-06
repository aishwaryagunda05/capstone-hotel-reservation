using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelReservationApi.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomIdToServiceRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RoomId",
                table: "ServiceRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_RoomId",
                table: "ServiceRequests",
                column: "RoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Rooms_RoomId",
                table: "ServiceRequests",
                column: "RoomId",
                principalTable: "Rooms",
                principalColumn: "RoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Rooms_RoomId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_RoomId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "ServiceRequests");
        }
    }
}
