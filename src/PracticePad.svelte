<style>
	.complete {
		color: rgb(0, 94, 0);
		font-weight: bold;
	}
	
	input {
		width: 100%;
	}
</style>

<script>
	import TargetText from './TargetText.svelte'
	
	export let problemSet = {
		name: "Example set",
		problems: ["Example text to write!"],
	};

	export let setProblemIndex = function(index) {
		currentProblemIndex = index;
	}
	
	let debug = false;

	let currentProblemIndex = 0;
	
	let currentProblem = problemSet.problems[currentProblemIndex];
	let	remainingText = currentProblem;
	let confirmedText = "";
	let pendingText = "";

	$: {
		currentProblem = problemSet.problems[currentProblemIndex];
		remainingText = currentProblem;
		confirmedText = "";
		pendingText = "";
	}	
	$: writtenText = `${confirmedText}${pendingText}`;
	$: setCompleted = (currentProblemIndex === problemSet.problems.length-1) && remainingText === "";
	
	function handleInput(e){
		const pendingAndRemainingMatch = pendingText === remainingText;
		if (e.data === " " || pendingAndRemainingMatch) {
			const wordCorrect = pendingAndRemainingMatch || (pendingText === remainingText.substring(0, pendingText.length));
			if (wordCorrect) {
				remainingText = remainingText.slice(pendingText.length);
			  confirmedText = `${confirmedText}${pendingText}`;
			  pendingText = "";
			}
		}
	}
	
	function handleKeyUp(e) {
		if (e.code === "Enter" && remainingText === "") {
			generateNewProblem();
		}
	}

	
	function generateNewProblem() {
		console.log(setCompleted, currentProblemIndex, problemSet.problems.length-1);
		
		if(!setCompleted){
			currentProblemIndex += 1;
		}
	}
</script>

{#if setCompleted}
	<strong>Congratulations, you finished the problem set!</strong>
{:else}
	<TargetText textToWrite={currentProblem} writtenText={writtenText} />
	<br />
	<input 
		autofocus
		type=text 
		placeholder={confirmedText === "" ? `${currentProblem.slice(0,10)}...` : "" } 
		on:input={handleInput} 
		on:keyup={handleKeyUp} 
		bind:value={pendingText}/>
	<div>
		{#if remainingText === ""}
			<div class="complete" >Complete! Hit Return &crarr; for another challenge!</div>
		{/if}
		{#if debug}
		<div>remainingText: "{remainingText}"</div>
		<div>writtenText: "{writtenText}"</div>
		<div>confirmedText: "{confirmedText}"</div>
		<div>pendingText: "{pendingText}"</div>
		<div>currentProblem: "{currentProblem}"</div>
		{/if}
	</div>
{/if}
