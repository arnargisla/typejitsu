import App from './App.svelte';
import * as signalR from '@aspnet/signalr';

var app = new App({
	target: document.body
});

console.log(signalR);

var connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:7000/raceHub").build();

connection.on("ReceiveMessage", function (message) {
    console.log(`Received message: ${message}`);
});

connection.start(/*{ withCredentials: false }*/).then(function(){
	console.log("Successfully connected to hub");
}).catch(function (err) {
    console.error(err.toString());
});

window.g_test = function(message){
	connection.invoke("SendMessage", message).catch(function (err) {
		return console.error(err.toString());
	});
}


export default app;