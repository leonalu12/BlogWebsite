import {writable} from 'svelte/store';

export const logedIn = writable(false);

export const displayRegister = writable(false);

export const displayEdit = writable(false);

displayEdit.subscribe(value => {
  console.log(value);
}); 