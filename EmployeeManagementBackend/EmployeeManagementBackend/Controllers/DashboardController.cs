using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public DashboardController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpGet("hiring-trend")]
        public async Task<IActionResult> GetHiringTrend([FromQuery] int year)
        {
            var trend = await _context.Employees
                .Where(e => e.HireDate.Year == year)
                .GroupBy(e => e.HireDate.Month)
                .Select(g => new
                {
                    Month = g.Key,
                    Hires = g.Count()
                })
                .OrderBy(x => x.Month)
                .ToListAsync();

            return Ok(trend);
        }

        [HttpGet("department-growth")]
        public async Task<IActionResult> GetDepartmentGrowth()
        {
            var growth = await _context.Departments
                .Select(d => new
                {
                    Department = d.Name,
                    EmployeeCount = d.Employees.Count(e => e.EmploymentStatus == EmploymentStatus.Active)
                })
                .OrderByDescending(x => x.EmployeeCount)
                .ToListAsync();

            return Ok(growth);
        }

        [HttpGet("attendance-pattern")]
        public async Task<IActionResult> GetAttendancePattern([FromQuery] int year, [FromQuery] int month)
        {
            var pattern = await _context.Attendances
                .Where(a => a.AttendanceDate.Year == year && a.AttendanceDate.Month == month)
                .GroupBy(a => new { a.EmployeeId, a.Employee.FirstName, a.Employee.LastName })
                .Select(g => new
                {
                    EmployeeId = g.Key.EmployeeId,
                    EmployeeName = g.Key.FirstName + " " + g.Key.LastName,
                    PresentDays = g.Count(a => a.Status == AttendanceStatus.Present),
                    AbsentDays = g.Count(a => a.Status == AttendanceStatus.Absent),
                    LateDays = g.Count(a => a.Status == AttendanceStatus.Late),
                    TotalHours = g.Sum(a => a.TotalHours ?? 0)
                })
                .OrderByDescending(x => x.PresentDays)
                .ToListAsync();

            return Ok(pattern);
        }
    }
}
