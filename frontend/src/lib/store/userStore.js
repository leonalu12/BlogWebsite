import {writable} from 'svelte/store';

export const logedIn = writable(false);

export const displayRegister = writable(false);

export const displayEdit = writable(false);

export const displaySecurity = writable(false);

export const displayEditSuccessAlert = writable(false);

export const displayChangePwdAlert = writable(false);

displayEdit.subscribe(value => {
  console.log(value);
}); 