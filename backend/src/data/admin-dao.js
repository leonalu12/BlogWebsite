import { getDatabase } from "./database.js";

export async function authenticateAdmin(username, pwd) {
    const db = await getDatabase();
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', username);
    if (!admin) {
        return null;
    }

    if (pwd !== admin.pwd) {

        return null;
    }
    return admin;
}

