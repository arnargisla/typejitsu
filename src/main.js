import App from './App.svelte';
import RacingApp from './RacingApp.svelte';
import * as signalR from '@aspnet/signalr';
import { currentUsers, nameService, userStartTimeService, currentProblemStore } from './stores.js';

const signalRUrl = window.location.origin;
    
const connection = new signalR.HubConnectionBuilder()
	.withUrl(`${signalRUrl}/raceHub`)
    .configureLogging(signalR.LogLevel.Information)
	.build();

window.g_connection = connection;

const stateConversion = {0: 'connecting', 1: 'connected', 2: 'reconnecting', 4: 'disconnected'};
let myId = "";
let myStartTime = undefined;
let name = "";
let app;
let connectionAttempts = 0;
let masterStatus = false;
const racingGroup = window.location.hash.split("=")[1];

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

function resetProgress() {
    currentUsers.update(currentUsers => {
        Object.keys(currentUsers).map(userId => {
            currentUsers[userId].progress = 0;
            return currentUsers[userId];
        });
        return currentUsers;
    });
}

function setUser(userId, username, userObject, startTime) {
	username && addName(userId, username);
	startTime && setUserStartTime(userId, startTime);
	if(userObject === undefined) {
		userStartTimeService.update(startTimes => {
			delete startTimes[userId];
			return startTimes;
		});
		console.log(`removed user time: ${userId}`);
	}
	currentUsers.update(currentUsers => {
		if (userObject) {
			currentUsers[userId] = userObject;
		} else {
			delete currentUsers[userId];
		}
		return currentUsers;
	});
}

function setProblem(problem) {
    currentProblemStore.set(problem);
}

function addName(userId, username) {
	nameService.update(names => {
		names[userId] = username;
		return names;
	});
}

function setUserStartTime(userId, startTime) {
	console.log(`${startTime} Setting users ${userId} start time to `);
	console.log(`${myStartTime} My start time`)
	userStartTimeService.update(startTimes => {
		startTimes[userId] = startTime;
		return startTimes;
	});
}

if (window.location.hash.indexOf("#race")===0) {
	name = getName();
	const joinRaceGroup = waitForConnection().then(connection => {
		connection.invoke("joinGroup", racingGroup, name, `${myStartTime}`);
	});
	app	= new RacingApp({
		target: document.body,
		props: {
			signalrConnection: waitForConnection,
			racingGroup,
			myId: "me",
			joinRaceGroup,
			masterStatus,
		},
    });
} else {
	app	= new App({
		target: document.body,
	});
}

connection.onclose(async () => {
    await start();
});

function setMasterStatus(newMasterStatus) {
	masterStatus = newMasterStatus;
	app.$set({ masterStatus: masterStatus });
}

function setUpConnectionHandlers(){
	connection.on("UserDisconnected", function(userId) {
		console.log(`UserDisconnected: ${userId}`);
	});

	connection.on("ReceiveMessage", function (message) {
		console.log(`Received message: ${message}`);
	});

	connection.on("YouAre", userId => {
		myId = userId;
		const newDate = (new Date());
		myStartTime = `${newDate.getTime()}-${newDate.getUTCMilliseconds()}-${Math.random()}`;
		setUser(userId, name, { id: userId, progress: 0, name, }, myStartTime);

		app.$set({myId});
		console.log(`YouAre: ${userId}`);

		setTimeout(()=>{
			userStartTimeService.subscribe(startTimes => {
				let pendingMaster =true;
				for(let userid in startTimes) {
					console.log(userid, startTimes[userid]);
					console.log(`${userid} !== ${myId} && ${startTimes[userid]} < ${myStartTime} = ${startTimes[userid] < myStartTime}`);
					if(userid !== myId && startTimes[userid] < myStartTime) {
						pendingMaster = false;
					}
				}
				if (masterStatus !== pendingMaster) setMasterStatus(pendingMaster);
			});
		}, 3000);
	});

	connection.on("UserJoined", (userId, username, startTime) => {
		setUser(userId, username, { id: userId, progress: 0 }, startTime);
		if ( myId ) {
			waitForConnection().then(connection => connection.invoke("CallUser", userId, "ImHere", JSON.stringify({ userId: myId, username: name, startTime: myStartTime })));
		}
		console.log(`User: ${userId} ${username} ${startTime} joined`);
	});

	connection.on("UserLeft", userId => {
		setUser(userId, undefined, undefined);
		console.log(`User: ${userId} left`);
	});

	connection.on("ImHere", userstring => {
		let { userId, username, startTime } = JSON.parse(userstring);
		setUser(userId, username, { id: userId, progress: 0 }, startTime);
		console.log(`User: ${userId} ${username} ${userstring} says hello`);
	});

	connection.on("UserProgress", (userId, progress) => {
		setUser(userId, undefined, { id: userId, progress: progress, });
		console.log(`User: ${userId} joined`);
    });

	connection.on("NewProblem", (userId, problem) => {
        setProblem(problem);
        resetProgress();
		console.log(`New problem from ${userId}: "${problem}"`);
    });
    
}

setUpConnectionHandlers();
start();

export default app;
