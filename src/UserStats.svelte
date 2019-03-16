<style>
.me {
	font-weight: bold;
}

div {
    width: 100%;
}

</style>


<script>
    import ProgressBar from './ProgressBar.svelte';
    export let user = {};
    export let isme = false;


    function leftPad(s, length) {
        return (s.length < length ? Array(length - s.length).join(" ") : "") + s;
    }

</script>


<div class:me={isme}>
    {user.name ? user.name : user.id} {leftPad((user.progress*100).toFixed(1), 5)}%
    <ProgressBar progress={user.progress} />
</div>
