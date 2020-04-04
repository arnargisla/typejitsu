using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace SignalRChat.Hubs
{
    public class RaceHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("YouAre", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await Clients.Others.SendAsync("UserLeft", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task JoinGroup(string groupName, string username, string startTime)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.OthersInGroup(groupName).SendAsync("UserJoined", Context.ConnectionId, username, startTime);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            await Task.WhenAll(
                Clients.OthersInGroup(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has left the group {groupName}."),
                Clients.OthersInGroup(groupName).SendAsync("UserLeft", Context.ConnectionId));
        }

        public async Task Progress(string groupName, double progress, int wpm)
        {
            await Task.WhenAll(
                Clients.Group(groupName).SendAsync("UserProgress", Context.ConnectionId, progress, wpm),
                Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has set progress to {progress}, wpm: {wpm}."));
        }

        public async Task NewProblem(string groupName, string problem)
        {
            await Task.WhenAll(
                Clients.Group(groupName).SendAsync("NewProblem", Context.ConnectionId, problem),
                Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has set problem to {problem}."));
        }

        public async Task CallUser(string userid, string functionName, string argument)
        {
            await Clients.Client(userid).SendAsync(functionName, argument);
        }
    }
}