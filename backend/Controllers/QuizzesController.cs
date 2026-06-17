using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizApi.Models;

namespace QuizApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizzesController : ControllerBase
{
    private readonly QuizDbContext _db;
    public QuizzesController(QuizDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _db.Quizzes.Include(q=>q.Questions).ThenInclude(q=>q.Choices).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id) => Ok(await _db.Quizzes.Include(q=>q.Questions).ThenInclude(q=>q.Choices).FirstOrDefaultAsync(q=>q.Id==id));

    [HttpPost]
    public async Task<IActionResult> Create(Quiz quiz)
    {
        _db.Quizzes.Add(quiz);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = quiz.Id }, quiz);
    }
}
