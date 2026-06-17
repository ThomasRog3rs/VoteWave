using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace QuizApi.Hubs;

public class QuizHub : Hub
{
    public async Task JoinRoom(string roomId, string username)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("PlayerJoined", username);
    }

    public async Task LeaveRoom(string roomId, string username)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("PlayerLeft", username);
    }

    public async Task StartQuiz(string roomId)
    {
        await Clients.Group(roomId).SendAsync("QuizStarted");
    }

    public async Task SendQuestion(string roomId, object question)
    {
        await Clients.Group(roomId).SendAsync("ReceiveQuestion", question);
    }

    public async Task SubmitAnswer(string roomId, string username, int questionId, int choiceIndex)
    {
        await Clients.Group(roomId).SendAsync("ReceiveAnswer", username, questionId, choiceIndex);
    }
}
