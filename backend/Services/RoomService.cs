using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using QuizApi.Models;

namespace QuizApi.Services;

public class SubmitAnswerResult
{
    public bool Success { get; set; }
    public int AnsweredCount { get; set; }
    public int TotalPlayers { get; set; }
    public bool AllAnswered { get; set; }
}

public class RoomService
{
    private readonly ConcurrentDictionary<string, Room> _rooms = new();
    private readonly ConcurrentDictionary<string, string> _connectionToRoom = new();
    private static readonly Random _rng = new();

    public Room CreateRoom(int quizId, string quizTitle, List<QuestionSnapshot> questions, string hostUsername)
    {
        string code;
        do { code = GenerateCode(); } while (_rooms.ContainsKey(code));

        var room = new Room
        {
            Code = code,
            QuizId = quizId,
            QuizTitle = quizTitle,
            HostUsername = hostUsername,
            Questions = questions
        };

        _rooms[code] = room;
        return room;
    }

    public Room? GetRoom(string code) =>
        _rooms.GetValueOrDefault(code.ToUpperInvariant());

    public bool JoinRoom(string code, string username, string connectionId, out Room? room)
    {
        room = GetRoom(code);
        if (room is null) return false;

        // Remove any stale entries for this connection or username
        room.Players.RemoveAll(p => p.ConnectionId == connectionId || p.Username == username);
        room.Players.Add(new Player { Username = username, ConnectionId = connectionId });

        // Track connection → room mapping
        _connectionToRoom[connectionId] = code.ToUpperInvariant();
        return true;
    }

    public (string? Code, Room? Room, string? Username) RemovePlayer(string connectionId)
    {
        if (!_connectionToRoom.TryRemove(connectionId, out var code)) return (null, null, null);

        var room = GetRoom(code);
        if (room is null) return (code, null, null);

        var player = room.Players.FirstOrDefault(p => p.ConnectionId == connectionId);
        room.Players.RemoveAll(p => p.ConnectionId == connectionId);

        if (room.Players.Count == 0 && room.State == RoomState.Lobby)
            _rooms.TryRemove(code, out _);

        return (code, room, player?.Username);
    }

    public bool StartQuiz(string code, string username, out QuestionSnapshot? question, out Room? room)
    {
        room = GetRoom(code);
        question = null;

        if (room is null || room.HostUsername != username || room.State != RoomState.Lobby)
            return false;

        room.CurrentQuestionIndex = 0;
        room.Answers.Clear();
        room.Scores.Clear();
        foreach (var p in room.Players) room.Scores[p.Username] = 0;

        room.State = RoomState.Question;
        question = room.Questions[0];
        return true;
    }

    public SubmitAnswerResult SubmitAnswer(string code, string username, int choiceIndex)
    {
        var room = GetRoom(code);
        if (room is null || room.State != RoomState.Question)
            return new SubmitAnswerResult { Success = false };

        room.Answers[username] = choiceIndex;
        int answered = room.Answers.Count;
        int total = room.Players.Count;

        return new SubmitAnswerResult
        {
            Success = true,
            AnsweredCount = answered,
            TotalPlayers = total,
            AllAnswered = answered >= total
        };
    }

    public RevealResultDto? RevealResults(string code)
    {
        var room = GetRoom(code);
        if (room is null || room.State == RoomState.Results || room.State == RoomState.Lobby)
            return null;

        var question = room.Questions[room.CurrentQuestionIndex];

        var answers = room.Players.Select(p =>
        {
            int choiceIdx = room.Answers.GetValueOrDefault(p.Username, -1);
            bool correct = choiceIdx == question.CorrectIndex;
            if (correct)
                room.Scores[p.Username] = room.Scores.GetValueOrDefault(p.Username, 0) + 100;
            return new PlayerAnswer(p.Username, choiceIdx, correct);
        }).ToList();

        room.State = RoomState.Results;
        return new RevealResultDto(question.CorrectIndex, answers, new Dictionary<string, int>(room.Scores));
    }

    public (bool HasNext, QuestionSnapshot? Question, Room? Room) AdvanceQuestion(string code, string username)
    {
        var room = GetRoom(code);
        if (room is null || room.HostUsername != username || room.State != RoomState.Results)
            return (false, null, null);

        room.CurrentQuestionIndex++;
        room.Answers.Clear();

        if (room.CurrentQuestionIndex >= room.Questions.Count)
        {
            room.State = RoomState.Finished;
            return (false, null, room);
        }

        room.State = RoomState.Question;
        return (true, room.Questions[room.CurrentQuestionIndex], room);
    }

    public List<RoomInfo> GetActiveRooms() =>
        _rooms.Values
            .Where(r => r.State == RoomState.Lobby)
            .Select(ToRoomInfo)
            .ToList();

    public static RoomInfo ToRoomInfo(Room r) => new(
        r.Code,
        r.QuizId,
        r.QuizTitle,
        r.HostUsername,
        r.State.ToString(),
        r.Players.Select(p => p.Username).ToList()
    );

    private static string GenerateCode() =>
        new(Enumerable.Range(0, 4)
            .Select(_ => (char)('A' + _rng.Next(26)))
            .ToArray());
}
