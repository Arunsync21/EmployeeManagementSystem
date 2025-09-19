using EmployeeManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagementBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Manager,HR,Admin")]
    public class PerformanceController : ControllerBase
    {
        private readonly EmployeeManagementContext _context;

        public PerformanceController(EmployeeManagementContext context)
        {
            _context = context;
        }

        [HttpGet("{employeeId}")]
        public async Task<IActionResult> GetReviews(long employeeId)
        {
            var reviews = await _context.EmployeePerformances
                .Where(p => p.EmployeeId == employeeId)
                .OrderByDescending(p => p.ReviewDate)
                .ToListAsync();

            return Ok(reviews);
        }

        [HttpPost]
        public async Task<IActionResult> AddReview(EmployeePerformance review)
        {
            _context.EmployeePerformances.Add(review);
            await _context.SaveChangesAsync();
            return Ok(review);
        }
    }
}
