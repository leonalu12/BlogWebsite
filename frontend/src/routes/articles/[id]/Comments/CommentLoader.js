// import { PUBLIC_API_BASE_URL } from "$env/static/public";
// import { writable } from "svelte/store";
// const COMMENTS_URL = `${PUBLIC_API_BASE_URL}/comments`;

// export const comments = writable([]);

// export async function loadComments(id, fetch) {
//     try {
//         const response = await fetch(`${COMMENTS_URL}/${id}`, {
//             credentials: "include"
//         });
//         const comments = await response.json();
//         console.log(comments);
//         return comments;
//     } catch (error) {
//         console.error('Error loading comments:', error);
//         return [];
//     }
// }