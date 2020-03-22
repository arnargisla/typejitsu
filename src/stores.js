import { writable } from 'svelte/store';

export const currentUsers = writable({});
export const currentChallenge = writable({});
export const nameService = writable({});
export const userStartTimeService = writable({});
export const currentProblemStore = writable({});
export const problemSets = writable({
    problemSets: [
        {
            name: "Text",
            problems: [
                "What a wonderful world! A world where you can type and type as you wonder: What does it all mean? Let the letters flow through your fingertips, your fingers like little spiders on the keyboard.", 
                "What is this, magic? That is the question everyone is asking themselves, is it really magic or is it just a little bit of good luck and some SignalR?",
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
        {
            name: "Test",
            problems: [
                `two word`, 
                `another two words`,
                `test problem 1`,
                `test problem 2`,
                `test problem 3`,
                `test problem 4`,
                `test problem 5`,
                `test problem 6`,
            ],
        },
    ],
});