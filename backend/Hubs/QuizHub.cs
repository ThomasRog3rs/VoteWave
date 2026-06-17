using Microsoft.AspNetCore.SignalR;
using QuizApi.Models;
using QuizApi.Services;

namespace QuizApi.Hubs;

public class QuizHub : Hub
{
    private readonly RoomService _rooms;

    public QuizHub(RoomService rooms) => _rooms = rooms;

    public async Task JoinRoom(string roomCode, string username)
    {
        if (!_rooms.JoinRoom(roomCode, username, Context.ConnectionId, out var room) || room is null)
        {
            await Clients.Caller.SendAsync("Error", "Room not found");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, room.Code);
        await Clients.Group(room.Code).SendAsync("RoomUpdated", RoomService.ToRoomInfo(room));
    }

    public async Task StartQuiz(string roomCode, string username)
    {
        if (!_rooms.StartQuiz(roomCode, username, out var question, out var room) || question is null || room is null)
        {
            await Clients.Caller.SendAsync("Error", "Cannot start quiz — you may not be the host");
            return;
        }

        var dto = new QuestionDto(
            question.Id, question.Text, question.Choices,
            0, room.Questions.Count);

        await Clients.Group(room.Code).SendAsync("QuestionChanged", dto);
    }

    public async Task SubmitAnswer(string roomCode, string username, int choiceIndex)
    {
        var result = _rooms.SubmitAnswer(roomCode, username, choiceIndex);
        if (!result.Success) return;

        await Clients.Group(roomCode.ToUpperInvariant())
            .SendAsync("AnswerCount", result.AnsweredCount, result.TotalPlayers);

        if (result.AllAnswered)
            await BroadcastReveal(roomCode);
    }

    public async Task RevealResults(string roomCode, string username)
    {
        var room = _rooms.GetRoom(roomCode);
        if (room?.HostUsername != username) return;

        await BroadcastReveal(roomCode);
    }

    public async Task NextQuestion(string roomCode, string username)
    {
        var (hasNext, question, room) = _rooms.AdvanceQuestion(roomCode, username);
        if (room is null) return;

        if (hasNext && question is not null)
        {
            var dto = new QuestionDto(
                question.Id, question.Text, question.Choices,
                room.CurrentQuestionIndex, room.Questions.Count);

            await Clients.Group(room.Code).SendAsync("QuestionChanged", dto);
        }
        else
        {
            var scores = room.Scores
                .OrderByDescending(kvp => kvp.Value)
                .Select(kvp => new ScoreEntry(kvp.Key, kvp.Value))
                .ToList();

            await Clients.Group(room.Code).SendAsync("QuizFinished", scores);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var (code, room, username) = _rooms.RemovePlayer(Context.ConnectionId);
        if (code is not null && room is not null)
            await Clients.Group(code).SendAsync("RoomUpdated", RoomService.ToRoomInfo(room));

        await base.OnDisconnectedAsync(exception);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private async Task BroadcastReveal(string roomCode)
    {
        var reveal = _rooms.RevealResults(roomCode);
        if (reveal is not null)
            await Clients.Group(roomCode.ToUpperInvariant()).SendAsync("ResultsRevealed", reveal);
    }
}
