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

    export let onprogress = () => {};
    export let onProblemCompleted = () => console.log("onProblemCompleted");
	export let currentProblem = "Example problem";
    export let setCompleted = false;
    export let masterStatus = false;
    
    export const setCurrentProblem = problem => {
        currentProblem = problem;
    }
	
	let debug = false;

	let currentProblemIndex = 0;
	
    
	let	remainingText = currentProblem;
	let confirmedText = "";
    let pendingText = "";

	$: {
		remainingText = currentProblem;
		confirmedText = "";
        console.log("update everything", `currentproblem: ${currentProblem}`);
	}
	$: writtenText = `${confirmedText}${pendingText}`;
	
	function handleInput(e){
        const pendingTextWithNewChar = `${pendingText}${e.data}`
        const pendingAndRemainingMatch = (pendingTextWithNewChar === remainingText);

        if (pendingAndRemainingMatch) {
            remainingText = "";
            confirmedText = currentProblem;
            pendingText = "";
            onprogress(1.0);
        } else if (e.data === " ") {
            const pendingWithSpace = `${pendingText} `;
			const wordCorrect = pendingWithSpace.length > 0 && pendingAndRemainingMatch || (pendingWithSpace === remainingText.substring(0, pendingWithSpace.length));

			if (wordCorrect) {
                remainingText = remainingText.slice(pendingWithSpace.length);
                confirmedText = `${confirmedText}${pendingWithSpace}`;
                pendingText = "";
                onprogress(confirmedText.length / currentProblem.length);
			}
		}
	}
	
	function handleKeyUp(e) {
		if (e.code === "Enter" && remainingText === "") {
            onProblemCompleted();
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
		    {#if masterStatus}
			    <div class="complete" >Complete! Hit Return &crarr; for another challenge!</div>
		    {:else}
			    <div class="complete" >Complete!</div>
            {/if}
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
