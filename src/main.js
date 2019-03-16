import App from './App.svelte';
import RacingApp from './RacingApp.svelte';
import * as signalR from '@aspnet/signalr';
import { currentUsers, nameService } from './stores.js';

const signalRUrl = 
	window.href.location.indexOf("localhost") !== -1 ? "localhost:8888" : "46.101.48.35";
const connection = new signalR.HubConnectionBuilder()
	.withUrl(`http://${signalRUrl}/raceHub`)
    .configureLogging(signalR.LogLevel.Information)
	.build();

window.g_connection = connection;

const stateConversion = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
let myId = "";
let name = "";
let app;
let connectionAttempts = 0;

async function start() {
    try {
        await connection.start();
		console.log("Successfully connected to hub");
    } catch (err) {
		console.log(err);
		console.log("Retrying in 5 seconds");
		connectionAttempts += 1;
        if(connectionAttempts < 10) setTimeout(() => start(), 5000);
    }
}; 

async function waitForConnection() {
	let attempts = 0;
	const maxAttempts = 15;
	while(stateConversion[connection.connectionState] !== "connected" && attempts < maxAttempts) {
		await wait(0.2 + attempts * 0.5);	
		console.log("tryingtoconnect")	
		attempts++;

	}
	return connection;
}

async function wait(seconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, seconds * 1000);
	});
}

function getName() {
	let name = sessionStorage ? sessionStorage.getItem('name') : "";
	if(!name) {
		name = prompt("What is your name?"); 
		sessionStorage && sessionStorage.setItem('name', name);
	}
	return name;
}

function setUser(userId, username, userObject) {
	username && addName(userId, username);
	currentUsers.update(currentUsers => {
		if (userObject) {
			currentUsers[userId] = userObject;
		} else {
			delete currentUsers[userId];
		}
		return currentUsers;
	});
}

function addName(userId, username) {
	nameService.update(names => {
		names[userId] = username;
		return names;
	});
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

connection.onclose(async () => {
    await start();
});

function setUpConnectionHandlers(){
	connection.on("UserDisconnected", function(userId) {
		console.log(`UserDisconnected: ${userId}`);
	});

	connection.on("ReceiveMessage", function (message) {
		console.log(`Received message: ${message}`);
	});

	connection.on("YouAre", userId => {
		myId = userId;
		setUser(userId, name, { id: userId, progress: 0, name, });

		app.myId && app.$set({myId});
		console.log(`YouAre: ${userId}`);
	});

	connection.on("UserJoined", (userId, username) => {
		setUser(userId, username, { id: userId, progress: 0 });
		if(myId) {
			waitForConnection().then(connection => connection.invoke("CallUser", userId, "ImHere", JSON.stringify({ userId: myId, username: name, })));
		}
		console.log(`User: ${userId} joined`);
	});

	connection.on("UserLeft", userId => {
		setUser(userId, undefined, undefined);
		console.log(`User: ${userId} left`);
	});

	connection.on("ImHere", userstring => {
		let { userId, username } = JSON.parse(userstring);
		setUser(userId, username, { id: userId, progress: 0 });
		console.log(`User: ${userId} ${username} ${userstring} says hello`);
	});

	connection.on("UserProgress", (userId, progress) => {
		setUser(userId, undefined, { id: userId, progress: progress, });
		console.log(`User: ${userId} joined`);
	});
}

setUpConnectionHandlers();
start();

export default app;