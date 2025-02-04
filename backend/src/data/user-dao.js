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

export async function createUser(user) {
    try {
        let newUser = userSchema.validateSync(user, {
            abortEarly: false,
            stripUnknown: true
        });

        const saltRounds = 10;
        newUser.pwd = await bcrypt.hash(newUser.pwd, saltRounds);

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
    

    const db = await getDatabase();
    const response= await updateDatabase(db, "users", newUser, id);

    // Return true if changes were made, false otherwise.
    return response.changes > 0;
}


export async function deleteUser(id) {
    const db = await getDatabase();
    const response = await db.run('DELETE FROM Users WHERE id = ?', id);
    return response.changes > 0;
}
