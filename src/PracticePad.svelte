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
    export let masterStatus = false;
    export const setCompletedStatue = status => setCompleted = true;
    export const setCurrentProblem = problem => {
        initProblem();
        currentProblem = problem;
    }

    const delta = 100;
    let secondsToStart = 3;
    let startTime = 10000; 
    let setCompleted = false;

    function initProblem() {
        secondsToStart = 3;
        started = false;

        setTimeout(() => { 
            started = true;
            startTime = Date.now()
        }, 3000);

        const intervalId = setInterval(() => {
            secondsToStart -= delta/1000;
            if (secondsToStart < delta/2000) {
                clearInterval(intervalId);
            }
        }, delta);
    }
    


	let debug = false;

    let currentProblemIndex = 0;
    let timeMessage = "...";
    let started = false;

	let	remainingText = currentProblem;
	let confirmedText = "";
    let pendingText = "";
    let readOnly = true;
    let elapsedSeconds = 0;

    initProblem();

	$: {
		remainingText = currentProblem;
		confirmedText = "";
        console.log("update everything", `currentproblem: ${currentProblem}`);
	}
	$: writtenText = `${confirmedText}${pendingText}`;
    $: timeMessage = `Start typing in ${secondsToStart.toFixed(1)} ${secondsToStart < 2 ? "second" : "seconds" }`;
    $: placeholder = started ? confirmedText === "" ? `${currentProblem.slice(0,10)}...` : ""  : timeMessage;
    $: charactersTyped = confirmedText.length;
    $: wordsTyped = charactersTyped / 5;
    $: wpm = started && wordsTyped >= 2 ? (wordsTyped / (elapsedSeconds / 60)).toFixed(0) : 0;

	function handleInput(e){
        if(!started) {
            pendingText = "";
            return;
        }
        elapsedSeconds = (Date.now() - startTime) / 1000;
        const pendingTextWithNewChar = `${pendingText}${e.data}`
        const pendingAndRemainingMatch = (pendingTextWithNewChar === remainingText);

        if (pendingAndRemainingMatch) {
            remainingText = "";
            confirmedText = currentProblem;
            pendingText = "";
            onprogress(1.0, wpm);
        } else if (e.data === " ") {
            const pendingWithSpace = `${pendingText} `;
            const wordCorrect = pendingWithSpace.length > 0 && 
                pendingAndRemainingMatch || 
                (pendingWithSpace === remainingText.substring(0, pendingWithSpace.length));

			if (wordCorrect) {
                remainingText = remainingText.slice(pendingWithSpace.length);
                confirmedText = `${confirmedText}${pendingWithSpace}`;
                pendingText = "";
                onprogress(confirmedText.length / currentProblem.length, wpm);
			}
		}
    }
	
	function handleKeyUp(e) {
		if (e.code === "Enter" && remainingText === "") {
            pendingText = "";
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
		placeholder={placeholder}
		on:input={handleInput}
		on:keyup={handleKeyUp}
        readOnly={!started}
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
    <div>
        <span>wpm: {wpm}</span>
    </div>
{/if}
