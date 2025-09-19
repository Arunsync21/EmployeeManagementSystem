using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace EmployeeManagementBackend.Models
{
    [Table("EmployeeSalary")] // Specify the exact table name
    public class EmployeeSalary : AuditableEntity
    {
        [Key]
        public long EmployeeSalaryId { get; set; }

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        [Column(TypeName = "decimal(14,2)")] 
        public decimal TotalCTC { get; set; }

        [Column("Components")] // Map to the actual column name in database
        public string? ComponentsJson { get; set; }

        [NotMapped]
        public JsonDocument? Components
        {
            get => string.IsNullOrWhiteSpace(ComponentsJson) ? null : JsonDocument.Parse(ComponentsJson);
            set => ComponentsJson = value?.RootElement.GetRawText();
        }

        public long? ApprovedBy { get; set; }
        public AuthUser? ApprovedByUser { get; set; }
    }
}
