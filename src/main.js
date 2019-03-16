import App from './App.svelte';
import RacingApp from './RacingApp.svelte';
import * as signalR from '@aspnet/signalr';
import { currentUsers } from './stores.js';

const connection = new signalR.HubConnectionBuilder()
	.withUrl("https://localhost:7000/raceHub")
    .configureLogging(signalR.LogLevel.Information)
	.build();

window.g_connection = connection;

var stateConversion = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
let myId = "";
let app;


async function waitForConnection() {
	let attempts = 0;
	const maxAttempts = 5;
	while(stateConversion[connection.connectionState] !== "connected" && attempts < maxAttempts) {
		attempts++;
		await wait(5);
	}
	return connection;
}

if (window.location.hash.indexOf("#race")===0) {
	app	= new RacingApp({
		target: document.body,
		props: {
			signalrConnection: waitForConnection,
			racingGroup: window.location.hash.split("=")[1],
			myId: "me",
		}
	});
} else {
	app	= new App({
		target: document.body,
	});
}


async function start() {
    try {
        await connection.start();
		console.log("Successfully connected to hub");
    } catch (err) {
		console.log(err);
		console.log("Retrying in 5 seconds");
        setTimeout(() => start(), 5000);
    }
}; 

async function wait(seconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, seconds * 1000);
	});
}



connection.onclose(async () => {
    await start();
});

start();

connection.on("ReceiveMessage", function (message) {
    console.log(`Received message: ${message}`);
});

connection.on("YouAre", userId => {
	myId = userId;
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0, };
		return currentUsers;
	});
	app.myId && app.$set({myId});
	console.log(`YouAre: ${userId}`);
});

connection.on("UserJoined", userId => {
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0, };
		return currentUsers;
	});
	if(myId) {
		waitForConnection().then(connection => connection.invoke("CallUser", userId, "ImHere", myId));
	}
	console.log(`User: ${userId} joined`);
});

connection.on("ImHere", userId => {
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0, };
		return currentUsers;
	});
	console.log(`User: ${userId} says hello`);
});

connection.on("UserProgress", (userId, progress) => {
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: progress, };
		return currentUsers;
	});
	console.log(`User: ${userId} joined`);
});

connection.on("UserLeft", userId => {
	currentUsers.update(currentUsers => {
		currentUsers[userId] = undefined;
		return currentUsers;
	});
	console.log(`User: ${userId} left`);
});

window.g_test2 = async function(message){
	try {
		await connection.invoke("JoinGroup", "test-group");
	} catch (err) {
		return console.error(err.toString());
	};
}




export default app;