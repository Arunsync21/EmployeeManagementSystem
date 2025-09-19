using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace EmployeeManagementBackend.Models
{
    public class PayrunItem
    {
        [Key]
        public long PayrunItemId { get; set; }

        public long PayrunId { get; set; }
        public Payrun Payrun { get; set; } = null!;

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        [Column(TypeName = "decimal(14,2)")] public decimal GrossAmount { get; set; }
        [Column(TypeName = "decimal(14,2)")] public decimal NetAmount { get; set; }

        public string? ComponentsJson { get; set; }

        [NotMapped]
        public JsonDocument? Components
        {
            get => string.IsNullOrWhiteSpace(ComponentsJson) ? null : JsonDocument.Parse(ComponentsJson);
            set => ComponentsJson = value?.RootElement.GetRawText();
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public long? CreatedBy { get; set; }
    }
}
