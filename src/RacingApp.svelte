<style>

.main {
	background-color: rgb(255, 255, 233);
	max-width: 500px;
	margin: 10px auto;
	padding: 1em;
}

a {
	margin-right: 1em;
}

</style>

<script>
	import PracticePad from './PracticePad.svelte';
	import UserStats from './UserStats.svelte';
	import { currentUsers, nameService } from './stores.js';


	export let racingGroup = "defaultRaceGroup";
	export let signalrConnection;
	export let myId = "";
	export let masterStatus = false;
		
	const problemSets = [
		{
			name: "Text",
			problems: [
				"What a wonderful world! A world where you can type and type as you wonder: What does it all mean? Let the letters flow through your fingertips, your fingers like little spiders on the keyboard.", 
				"What is this, magic? That is the question everyone is asking themselves, is it really magic or is it just a little bit of good luck and some SignalR?",
			],
		},
		{
			name: "Code",
			problems: [
				`function(x) { return x; }`, 
				`() => { return "Hello, world!"; }`,
			],
		},
		{
			name: "Numbers & Symbols",
			problems: [
				`1820 3949 0695 8231`, 
				`%*@! <(}! >?|) *@)# []&* =~-\\ /.$\{`,
			],
		},
	];

	let currentProblemSet = problemSets[0];
	let practicePad;
	export let joinRaceGroup;

	function handleClick(e, problemIndex) {
		practicePad.setProblemIndex(0);
		currentProblemSet = problemSets[problemIndex];
		e.preventDefault();
	}

	function progressHandler(progress){
		signalrConnection().then(connection => connection.invoke("Progress", racingGroup, progress));
	}
</script>

<div class="main">
	<strong>Master status: {masterStatus}</strong>
	<h2>🏍️ Welcome to Racing in TypeJitsu</h2>

	{#await joinRaceGroup}
		<p>...connecting to racing group</p>
	{:then joined}
		<div>Type the text below into the text field.</div>
		<hr>
		<PracticePad bind:this={practicePad} onprogress={progressHandler} problemSet={currentProblemSet} />
	{:catch error}
		<p style="color: red">Error joining racing group {error.message}</p>
	{/await}

	<hr>
	<div>
		Connected users:
		{#each Object.keys($currentUsers) as userKey}
			<UserStats isme={userKey===myId} user={$currentUsers[userKey]} />
		{/each}
	</div>

</div>
