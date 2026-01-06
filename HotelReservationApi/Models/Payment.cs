using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HotelReservation.Api.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int InvoiceId { get; set; }
        [ForeignKey("InvoiceId")]
        public Invoice Invoice { get; set; } = null!;

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(12,2)")]
        public decimal AmountPaid { get; set; }

        [Required]
        [MaxLength(30)]
        public string PaymentMode { get; set; } = null!; // Cash / Card / UPI

        [MaxLength(100)]
        public string? TransactionRef { get; set; }
    }
}
