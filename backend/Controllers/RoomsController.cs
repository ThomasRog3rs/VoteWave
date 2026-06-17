using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizApi.Models;
using QuizApi.Services;

namespace QuizApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly RoomService _rooms;
    private readonly QuizDbContext _db;

    public RoomsController(RoomService rooms, QuizDbContext db)
    {
        _rooms = rooms;
        _db = db;
    }

    [HttpGet]
    public IActionResult GetActiveRooms() => Ok(_rooms.GetActiveRooms());

    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        var quiz = await _db.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Choices)
            .FirstOrDefaultAsync(q => q.Id == request.QuizId);

        if (quiz is null) return NotFound("Quiz not found");

        var questions = quiz.Questions.Select(q => new QuestionSnapshot
        {
            Id = q.Id,
            Text = q.Text,
            Choices = q.Choices.Select(c => c.Text).ToList(),
            CorrectIndex = q.CorrectIndex
        }).ToList();

        var room = _rooms.CreateRoom(quiz.Id, quiz.Title, questions, request.HostUsername);
        return Ok(RoomService.ToRoomInfo(room));
    }
}
