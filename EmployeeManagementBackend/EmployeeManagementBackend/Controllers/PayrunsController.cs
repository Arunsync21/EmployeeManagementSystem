using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,HR")]
    public class PayrunsController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public PayrunsController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePayrun(DateTime periodStart, DateTime periodEnd)
        {
            var employees = await _context.Employees.ToListAsync();

            var payrun = new Payrun
            {
                PayrunName = $"Payrun-{DateTime.UtcNow:yyyyMMdd}",
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                Status = PayrunStatus.Draft
            };

            foreach (var emp in employees)
            {
                if (emp.CurrentSalary.HasValue)
                {
                    var item = new PayrunItem
                    {
                        EmployeeId = emp.EmployeeId,
                        GrossAmount = emp.CurrentSalary.Value,
                        NetAmount = emp.CurrentSalary.Value, // placeholder
                        CreatedAt = DateTime.UtcNow
                    };
                    payrun.Items.Add(item);
                    payrun.TotalAmount += item.NetAmount;
                }
            }

            _context.Payruns.Add(payrun);
            await _context.SaveChangesAsync();

            return Ok(payrun);
        }
    }
}
