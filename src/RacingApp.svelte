<script>
  import PracticePad from "./PracticePad.svelte";
  import UserStats from "./UserStats.svelte";
  import {
    currentUsers,
    nameService,
    currentProblemStore,
    problemSets
  } from "./stores.js";

  export let racingGroup = "defaultRaceGroup";
  export let signalrConnection;
  export let myId = "";
  export let masterStatus = false;

  let currentProblemSet = $problemSets.problemSets[3];
  let currentProblem = currentProblemSet[0];
  let practicePad;
  let currentProblemIndex = 0;

  $: currentProblem = currentProblemSet.problems[currentProblemIndex];

  export let joinRaceGroup;

  function handleClick(e, problemIndex) {
    practicePad.setProblemIndex(0);
    currentProblemSet = $problemSets.problems[problemIndex];
    e.preventDefault();
  }

  function progressHandler(progress, wpm) {
    signalrConnection().then(connection =>
      connection.invoke("Progress", racingGroup, progress, wpm)
    );
  }

  function problemCompletedHandler() {
    console.log("problemCompletedHandler");
    if (masterStatus) {
      if (currentProblemIndex >= currentProblemSet.problems.length - 1) {
        if (practicePad) practicePad.setCompletedStatue(true);
        console.log("set completed!");
      } else {
        currentProblemIndex += 1;
        if (practicePad) practicePad.setCurrentProblem(currentProblem);
        signalrConnection().then(connection =>
          connection.invoke("NewProblem", racingGroup, currentProblem)
        );
        //signalrConnection().then(connection => connection.invoke("Progress", racingGroup, 0));
      }
    }
  }

  const unsubscribe = currentProblemStore.subscribe(problem => {
    if (!masterStatus && problem) {
      if (practicePad) practicePad.setCurrentProblem(problem);
    }
  });
</script>

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

<div class="main">
  <h2>🏍️ Welcome to Racing in TypeJitsu {masterStatus ? '🔵' : '🔴'}</h2>
  {#await joinRaceGroup}
    <p>...connecting to racing group</p>
  {:then joined}
    <div>Type the text below into the text field.</div>
    <div> {currentProblemIndex <= currentProblemSet.problems.length - 1} </div>
    <hr />
    <PracticePad
      bind:this={practicePad}
      onprogress={progressHandler}
      {currentProblem}
      {masterStatus}
      onProblemCompleted={problemCompletedHandler} />
  {:catch error}
    <p style="color: red">Error joining racing group {error.message}</p>
  {/await}

  <hr />
  <div>
    Connected users:
    {#each Object.keys($currentUsers) as userKey}
      <UserStats isme={userKey === myId} user={$currentUsers[userKey]} />
    {/each}
  </div>

</div>
