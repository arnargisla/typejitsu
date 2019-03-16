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
    export let progress = 0;
</script>


<div >
    <span class="completed" style="width: {Math.floor(progress * 100) }%"></span>
</div>
