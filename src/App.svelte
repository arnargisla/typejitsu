<style>

.main {
	background-color: rgb(255, 255, 233);
	max-width: 500px;
	margin: 10px auto;
	padding: 1em;
}
</style>

<script>
	import PracticePad from './PracticePad.svelte';
	
	let problemSet = ["What a wonderful world!", "What is this, magic?"];
</script>

<div class="main">
	<h2>Welcome to TypeDojo</h2>
	<div>Type the text below into the text field.</div>
	<hr>
	<PracticePad problemSet={problemSet} />
</div>
