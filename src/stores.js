import { writable } from 'svelte/store';

export const currentUsers = writable({});
export const currentChallenge = writable({});
export const nameService = writable({});
export const userStartTimeService = writable({});