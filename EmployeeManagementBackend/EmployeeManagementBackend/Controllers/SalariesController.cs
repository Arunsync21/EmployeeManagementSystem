using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,HR")]
    public class SalariesController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public SalariesController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetByEmployee(long employeeId)
        {
            var salaries = await _context.EmployeeSalaries
                .Where(s => s.EmployeeId == employeeId)
                .OrderByDescending(s => s.EffectiveFrom)
                .ToListAsync();

            return Ok(salaries);
        }

        [HttpPost]
        public async Task<IActionResult> AddSalary(EmployeeSalary salary)
        {
            _context.EmployeeSalaries.Add(salary);
            await _context.SaveChangesAsync();
            return Ok(salary);
        }
    }
}
