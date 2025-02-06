import yup from 'yup';
import {getDatabase} from './database.js';
import {updateDatabase} from './util.js';
import bcrypt from 'bcrypt';

const userSchema = yup
.object({
    username: yup.string().required(),
    fname: yup.string().required(),
    lname: yup.string().required(),
    description : yup.string().required(),
    dob: yup.date().required(),
    pwd: yup.string().required(),
    icon: yup.string().required()
});

async function saltNewUser(user) {
    const saltRounds = 10;
    user.pwd = await bcrypt.hash(user.pwd, saltRounds);
    console.log("Salted Password:", user.pwd);
    return user;
}

export async function createUser(user) {
    try {
        let newUser = userSchema.validateSync(user, {
            abortEarly: false,
            stripUnknown: true
        });

        newUser = await saltNewUser(newUser);

        const db = await getDatabase();
        const response = await db.run(
            'INSERT INTO users (username, fname, lname, description, dob, pwd, icon) VALUES(?, ?, ?, ?, ?, ?, ?)', 
            newUser.username, 
            newUser.fname,
            newUser.lname, 
            newUser.description,
            newUser.dob, 
            newUser.pwd,
            newUser.icon
        );

        newUser.id = response.lastID;
        return newUser;
    } catch (error) {
        throw new Error(`Error creating user: ${error.message}`);
    }
}

export async function authenticateUser(username, pwd) {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);
    if (!user) {
        return null;
    }
    const match = await bcrypt.compare(pwd, user.pwd);
    if (!match) {
        return null;
    }
    return user;
}



export async function getUsers() {
  const db = await getDatabase();
  const users = await db.all('SELECT * FROM users');
  return users;
}
 
export async function getUsersByUsername(username) {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);
    return user;
    }


export async function updateUser(user,id) {
    const newUser=userSchema.validateSync(user,{
        abortEarly:false,
        stripUnknown: true
    });

    const saltedUser = await saltNewUser(newUser);
    console.log("1234");
    console.log(newUser);

    const db = await getDatabase();
    const response= await updateDatabase(db, "users", saltedUser, id);

    // Return true if changes were made, false otherwise.
    return response.changes > 0;
}

export async function getUsernameById(id) {
    const db = await getDatabase();
    const user = await db.get('SELECT username FROM users WHERE id = ?', id);
    return user.username;
}

export async function getIdByUsername(username) {
    const db = await getDatabase();
    const user = await db.get('SELECT id FROM users WHERE username = ?', username);
    return user.id;
}


export async function deleteUser(id) {
    const db = await getDatabase();
    const response = await db.run('DELETE FROM Users WHERE id = ?', id);
    return response.changes > 0;
}
