using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementBackend.Models
{
    public class Payrun : AuditableEntity
    {
        [Key]
        public long PayrunId { get; set; }

        [MaxLength(100)] public string? PayrunName { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public PayrunStatus Status { get; set; } = PayrunStatus.Draft;

        [Column(TypeName = "decimal(14,2)")] public decimal TotalAmount { get; set; } = 0;

        public ICollection<PayrunItem> Items { get; set; } = new List<PayrunItem>();
    }
}
