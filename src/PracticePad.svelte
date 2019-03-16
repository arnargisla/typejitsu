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
	
	export let problemSet = ["Example text to write!"];
	
	let currentProblemIndex = 0;
	let currentProblem = problemSet[currentProblemIndex];
	let remainingText = currentProblem;
	let confirmedText = "";
	let pendingText = "";
	let debug = false;
	let setCompleted = false;
		
	$: writtenText = `${confirmedText}${pendingText}`;
	
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
		currentProblemIndex += 1;
		if (currentProblemIndex > problemSet.length-1) {
			setCompleted = true;
		} else {
			currentProblem= problemSet[currentProblemIndex];
			remainingText = currentProblem;
			confirmedText = "";
			pendingText = "";
		}
	}
</script>


{#if setCompleted}
	<strong>Congratulations, you finished the problem set!</strong>
{:else}
	<TargetText textToWrite={currentProblem} writtenText={writtenText} />
	<br />
	<input 
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
		{/if}
	</div>
{/if}
