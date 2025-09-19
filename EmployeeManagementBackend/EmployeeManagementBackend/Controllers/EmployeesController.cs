using EmployeeManagementBackend.Models;
using EmployeeManagementBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;
        private readonly IPasswordService _passwordService;

        public EmployeesController(EmployeeManagementContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _context.Employees
                .Where(e => e.IsActive)
                .Include(e => e.Department)
                .Include(e => e.Manager)
                .ToListAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var emp = await _context.Employees
                .Where(e => e.IsActive)
                .Include(e => e.Department)
                .Include(e => e.Manager)
                .Include(e => e.AuthUser)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);

            if (emp == null) return NotFound();

            var employeeDto = new EmployeeDto
            {
                EmployeeId = emp.EmployeeId,
                FirstName = emp.FirstName,
                LastName = emp.LastName,
                Email = emp.Email,
                PhoneNumber = emp.PhoneNumber,
                DateOfBirth = emp.DateOfBirth,
                Gender = emp.Gender,

                Address = emp.Address,
                City = emp.City,
                State = emp.State,
                Country = emp.Country,

                DepartmentId = emp.DepartmentId,
                Position = emp.Position,

                Role = emp.AuthUser?.Role ?? UserRole.Employee,
                EmploymentType = emp.EmploymentType,
                EmploymentStatus = emp.EmploymentStatus,
                HireDate = emp.HireDate,
                TerminationDate = emp.TerminationDate,

                CurrentSalary = emp.CurrentSalary,
                Currency = emp.Currency,

                EmergencyContactName = emp.EmergencyContactName,
                EmergencyContactPhone = emp.EmergencyContactPhone,

                CreatedBy = emp.CreatedBy
            };

            return Ok(employeeDto);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create(EmployeeDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if email already exists in AuthUsers table
            var existingAuthUser = await _context.AuthUsers
                .FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (existingAuthUser != null)
            {
                return BadRequest($"Email '{dto.Email}' is already registered in the system");
            }

            // Check if email already exists in Employees table
            var existingEmployee = await _context.Employees
                .FirstOrDefaultAsync(e => e.Email == dto.Email);

            if (existingEmployee != null)
            {
                return BadRequest($"Employee with email '{dto.Email}' already exists");
            }

            // Get the department to retrieve its manager
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.DepartmentId == dto.DepartmentId);

            if (department == null)
            {
                return BadRequest("Invalid Department ID");
            }

            var employee = new Employee
            {
                EmployeeCode = "",
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,

                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Country = dto.Country,

                DepartmentId = dto.DepartmentId,
                Position = dto.Position,
                ManagerId = department.ManagerId, // Use department manager

                EmploymentType = dto.EmploymentType,
                EmploymentStatus = dto.EmploymentStatus,
                HireDate = dto.HireDate,
                TerminationDate = dto.TerminationDate,
                CurrentSalary = dto.CurrentSalary,
                Currency = dto.Currency,

                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone,

                CreatedAt = DateTime.UtcNow,
                CreatedBy = dto.CreatedBy
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Add employee first
                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                // Generate employee code
                employee.EmployeeCode = $"EMP{employee.EmployeeId:D3}"; // e.g. EMP001
                _context.Update(employee);
                await _context.SaveChangesAsync();

                // Create AuthUser for the employee
                var authUser = new AuthUser
                {
                    Username = dto.Email, // Use email as username
                    Email = dto.Email,
                    PasswordHash = _passwordService.HashPassword("password123"), // Default password
                    Role = dto.Role,
                    EmployeeId = employee.EmployeeId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = dto.CreatedBy
                };

                _context.AuthUsers.Add(authUser);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetById), new { id = employee.EmployeeId }, employee);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error creating employee and user account", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(long id, EmployeeDto dto)
        {
            if (id != dto.EmployeeId) return BadRequest("Mismatched EmployeeId");

            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound();

            // Check if email is being changed and if new email already exists
            if (employee.Email != dto.Email)
            {
                var existingAuthUser = await _context.AuthUsers
                    .FirstOrDefaultAsync(u => u.Email == dto.Email);

                if (existingAuthUser != null)
                {
                    return BadRequest($"Email '{dto.Email}' is already registered in the system");
                }

                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Email == dto.Email && e.EmployeeId != id);

                if (existingEmployee != null)
                {
                    return BadRequest($"Employee with email '{dto.Email}' already exists");
                }
            }

            // Get the department to retrieve its manager
            var department = await _context.Departments
                .FirstOrDefaultAsync(d => d.DepartmentId == dto.DepartmentId);

            if (department == null)
            {
                return BadRequest("Invalid Department ID");
            }

            employee.FirstName = dto.FirstName;
            employee.LastName = dto.LastName;
            employee.Email = dto.Email;
            employee.PhoneNumber = dto.PhoneNumber;
            employee.DateOfBirth = dto.DateOfBirth;
            employee.Gender = dto.Gender;

            employee.Address = dto.Address;
            employee.City = dto.City;
            employee.State = dto.State;
            employee.Country = dto.Country;

            employee.DepartmentId = dto.DepartmentId;
            employee.Position = dto.Position;
            employee.ManagerId = department.ManagerId; // Update to department manager

            employee.EmploymentType = dto.EmploymentType;
            employee.EmploymentStatus = dto.EmploymentStatus;
            employee.HireDate = dto.HireDate;
            employee.TerminationDate = dto.TerminationDate;
            employee.CurrentSalary = dto.CurrentSalary;
            employee.Currency = dto.Currency;

            employee.EmergencyContactName = dto.EmergencyContactName;
            employee.EmergencyContactPhone = dto.EmergencyContactPhone;

            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedBy = dto.CreatedBy;

            // Update corresponding AuthUser if it exists
            var authUser = await _context.AuthUsers
                .FirstOrDefaultAsync(u => u.EmployeeId == employee.EmployeeId);

            if (authUser != null)
            {
                authUser.Email = dto.Email;
                authUser.Username = dto.Email; // Keep username in sync with email
                authUser.Role = dto.Role;
                authUser.UpdatedAt = DateTime.UtcNow;
                authUser.UpdatedBy = dto.CreatedBy;
            }
            else
            {
                var newAuthUser = new AuthUser
                {
                    Username = dto.Email, // Use email as username
                    Email = dto.Email,
                    PasswordHash = _passwordService.HashPassword("password123"), // Default password
                    Role = dto.Role,
                    EmployeeId = employee.EmployeeId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = dto.CreatedBy
                };
                _context.AuthUsers.Add(newAuthUser);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(long id)
        {
            var emp = await _context.Employees.FindAsync(id);
            if (emp == null) return NotFound();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Soft delete employee
                emp.IsActive = false;
                emp.DeletedAt = DateTime.UtcNow;

                // Also soft delete corresponding AuthUser
                var authUser = await _context.AuthUsers
                    .FirstOrDefaultAsync(u => u.EmployeeId == emp.EmployeeId);

                if (authUser != null)
                {
                    authUser.IsActive = false;
                    authUser.DeletedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error deleting employee and user account", error = ex.Message });
            }
        }

        [HttpPost("bulk-delete")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BulkDelete([FromBody] List<long> ids)
        {
            if (ids == null || !ids.Any())
                return BadRequest("No employee IDs provided.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var employees = await _context.Employees
                    .Where(e => ids.Contains(e.EmployeeId))
                    .ToListAsync();

                if (!employees.Any())
                    return NotFound("No employees found for the given IDs.");

                // Soft delete employees
                foreach (var emp in employees)
                {
                    emp.IsActive = false;
                    emp.DeletedAt = DateTime.UtcNow;
                }

                // Also soft delete corresponding AuthUsers
                var employeeIds = employees.Select(e => e.EmployeeId).ToList();
                var authUsers = await _context.AuthUsers
                    .Where(u => u.EmployeeId.HasValue && employeeIds.Contains(u.EmployeeId.Value))
                    .ToListAsync();

                foreach (var authUser in authUsers)
                {
                    authUser.IsActive = false;
                    authUser.DeletedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = $"{employees.Count} employees and {authUsers.Count} user accounts soft-deleted successfully."
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error bulk deleting employees and user accounts", error = ex.Message });
            }
        }

    }
}
