<style>
	.correct {
		color: #27c0278a;
	}
	.incorrect {
		color: red;
		border: 1px solid grey;
	}
	
	span {
		font-family: monospace, monospace;
	}
</style>

<script>
	export let textToWrite = "Populate the textToWrite prop to insert your own text to write!";
	export let writtenText = "";
	export let debug = false;
	
	function computeMatchingPrefix(writtenText, textToWrite) {
		for (let i=writtenText.length; i>0; i--) {
			let p1 = writtenText.slice(0, i);
			let p2 = textToWrite.slice(0, i);	
			if (p1 === p2) {
				return p1;
			}
		}
		return "";
	}
	
	$: matchingPrefix = computeMatchingPrefix(writtenText, textToWrite);
	$: numberOfErrors = writtenText.length - matchingPrefix.length;
	$: errorPart = textToWrite.slice(matchingPrefix.length, matchingPrefix.length+numberOfErrors);
	$: remainingPart = textToWrite.slice(matchingPrefix.length+numberOfErrors);
</script>

<div>
	<span class="correct">{matchingPrefix}</span><span class="incorrect">{errorPart}</span><span>{remainingPart}</span>
</div>
{#if debug}
<div>
	WrittenText: <span>"{writtenText}"</span>
</div>
<div>
	Matching Prefix: <span>"{matchingPrefix}"</span>
</div>
<div>
	Rest: <span>"{textToWrite.slice(matchingPrefix.length)}"</span>
</div>
<div>
	Wrong letters: <span>"{writtenText.slice(matchingPrefix.length)}"</span>
</div>
<div>
	no errors: <span>"{numberOfErrors}"</span>
</div>
{/if}