import { PUBLIC_API_BASE_URL } from "$env/static/public";

const COMMENTS_URL = `${PUBLIC_API_BASE_URL}/comments`;

export async function load({ params,fetch }) {
    const response = await fetch(`${COMMENTS_URL}/${params.id}`,{credentials: "include"});
    const comments = await response.json();
    console.log(comments);
    return { comments };
}

