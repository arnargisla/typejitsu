<style>

div {
    width: 100%;
    height: 1em;
    border: 1px solid rgb(58, 62, 68);
    background-color: rgba(132, 132, 187, 0.116);
}

span{
    height: 100%;
    display: block;
}

.completed {
    background-color: rgb(140, 140, 187);
}

</style>


<script>
    import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const progressTweened = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
    export let progress = 0;
    $: {
        progressTweened.set(Math.floor(progress * 100))
    }
</script>


<div >
    <span class="completed" style="width: {$progressTweened}%"></span>
</div>
