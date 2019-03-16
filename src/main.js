import App from './App.svelte';
import RacingApp from './RacingApp.svelte';
import * as signalR from '@aspnet/signalr';
import { currentUsers, nameService } from './stores.js';

const connection = new signalR.HubConnectionBuilder()
	.withUrl("http://localhost:8888/raceHub")
    .configureLogging(signalR.LogLevel.Information)
	.build();

window.g_connection = connection;

var stateConversion = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
let myId = "";
let app;
let name = "";


async function waitForConnection() {
	let attempts = 0;
	const maxAttempts = 5;
	while(stateConversion[connection.connectionState] !== "connected" && attempts < maxAttempts) {
		attempts++;
		await wait(5);
	}
	return connection;
}

function getName() {
	let name = sessionStorage ? sessionStorage.getItem('name') : "";
	if(!name) {
		name = prompt("What is your name?"); 
		sessionStorage && sessionStorage.setItem('name', name);
	}
	return name;
}

if (window.location.hash.indexOf("#race")===0) {
	name = getName();
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

let attempts = 0;
async function start() {
    try {
        await connection.start();
		console.log("Successfully connected to hub");
    } catch (err) {
		console.log(err);
		console.log("Retrying in 5 seconds");
		attempts += 1;
        if(attempts < 10) setTimeout(() => start(), 5000);
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
	addName(myId, name);
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0, name, };
		return currentUsers;
	});
	app.myId && app.$set({myId});
	console.log(`YouAre: ${userId}`);
});

connection.on("UserJoined", (userId, username) => {
	addName(userId, username);
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0 };
		return currentUsers;
	});
	if(myId) {
		waitForConnection().then(connection => connection.invoke("CallUser", userId, "ImHere", JSON.stringify({ userId: myId, username: name, })));
	}
	console.log(`User: ${userId} joined`);
});

function addName(userId, username) {
	nameService.update(names => {
		names[userId] = username;
		return names;
	});
}
connection.on("ImHere", userstring => {
	let { userId, username } = JSON.parse(userstring);
	addName(userId, username);	
	currentUsers.update(currentUsers => {
		currentUsers[userId] = { id: userId, progress: 0 };
		return currentUsers;
	});
	console.log(`User: ${userId} ${username} ${userstring} says hello`);
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