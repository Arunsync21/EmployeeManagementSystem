using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public DepartmentsController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetDepartments()
        {
            var departments = await _context.Departments
                .Where(d => d.DeletedAt == null) // exclude soft-deleted
                .Select(d => new DepartmentDto
                {
                    DepartmentId = d.DepartmentId,
                    Name = d.Name,
                    Code = d.Code,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    EmployeeCount = _context.Employees
                        .Count(e => e.DepartmentId == d.DepartmentId && e.IsActive),
                    ManagerName = _context.Employees
                        .Where(e => e.EmployeeId == d.ManagerId && e.IsActive)
                        .Select(e => e.FirstName + " " + e.LastName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(departments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DepartmentDto>> GetDepartment(long id)
        {
            var department = await _context.Departments
                .Where(d => d.DepartmentId == id && d.DeletedAt == null)
                .Select(d => new DepartmentDto
                {
                    DepartmentId = d.DepartmentId,
                    Name = d.Name,
                    Code = d.Code,
                    IsActive = d.IsActive,
                    CreatedAt = d.CreatedAt,
                    EmployeeCount = _context.Employees
                        .Count(e => e.DepartmentId == d.DepartmentId && e.DeletedAt == null),
                    ManagerName = _context.Employees
                        .Where(e => e.DepartmentId == d.DepartmentId && e.ManagerId == null && e.DeletedAt == null)
                        .Select(e => e.FirstName + " " + e.LastName)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (department == null)
            {
                return NotFound();
            }

            return Ok(department);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(long id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            department.DeletedAt = DateTime.UtcNow;
            _context.Departments.Update(department);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
