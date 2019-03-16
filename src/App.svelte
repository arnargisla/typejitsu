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
		
	const problemSets = [
		{
			name: "Text",
			problems: [
				"What a wonderful world!", 
				"What is this, magic?",
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

	function handleClick(e, problemIndex) {
		practicePad.setProblemIndex(0);
		currentProblemSet = problemSets[problemIndex];
		e.preventDefault();
	}
</script>

<div class="main">
	<h2>Welcome to TypeDojo</h2>
	<div>
		{#each problemSets as problemSet, i}
		<a href="#{problemSet.name}" on:click={ e => handleClick(e, i) }>{problemSet.name}</a>
		{/each}
	</div>
	<div>Type the text below into the text field.</div>
	<hr>
	<PracticePad bind:this={practicePad} problemSet={currentProblemSet} />
</div>
