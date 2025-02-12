import {writable} from 'svelte/store';

export const logedIn = writable(false);

export const displayRegister = writable(false);

export const displayEdit = writable(false);

export const displaySecurity = writable(false);

export const displayEditSuccessAlert = writable(false);

export const displayChangePwdAlert = writable(false);

export const deleteUserSuccess = writable(false);

export const displayLogin = writable(false);

export const displayLogoutSuccess = writable(false);

export const displayDeleteCommentAlert = writable(false);

export const iconName = writable("");

displayEdit.subscribe(value => {
  console.log(value);
}); 