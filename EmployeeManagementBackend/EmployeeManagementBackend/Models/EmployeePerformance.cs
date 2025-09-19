using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementBackend.Models
{
    public class EmployeePerformance : AuditableEntity
    {
        [Key]
        public long PerformanceId { get; set; }

        public long EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;

        public DateTime ReviewDate { get; set; }
        [Column(TypeName = "decimal(3,2)")] public decimal? Rating { get; set; }
        public string? Goals { get; set; }
        public string? Achievements { get; set; }
        public string? Comments { get; set; }

        public long? ReviewedBy { get; set; }
        public AuthUser? Reviewer { get; set; }
    }
}
