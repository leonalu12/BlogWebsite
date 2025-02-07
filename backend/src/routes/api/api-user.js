import express from "express";
import { createUser,getUsersByUsername,deleteUser,updateUser,getUsers, getIdByUsername} from "../../data/user-dao.js";
import {requiresAuthentication} from "../../middleware/auth-middleware.js";
import { getUsernameFromJWT } from "../../data/jwt-util.js";
import { authenticateUser } from "../../data/user-dao.js";
import { checkUserExists } from "../../data/user-dao.js";

const router = express.Router();


router.get("/", requiresAuthentication, async (req, res) => {
  const username = getUsernameFromJWT(req.cookies.authToken);
  if (!username) {
    const users = await getUsers();
    return res.json(users);
  }
  const user = await getUsersByUsername(username);
  return res.json(user);
});

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const newUser = await createUser(user);
    return res.status(201).location(`/api/users/${newUser.id}`).json(newUser);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }   
});



router.delete("/:id", requiresAuthentication, async (req, res) => {
  const id = req.params.id;
  await deleteUser(id);
  return res.sendStatus(204);
});

router.patch("/", requiresAuthentication, async (req, res) => {
  const username = getUsernameFromJWT(req.cookies.authToken);
  const id = await getIdByUsername(username);
  const user = req.body;
  const updatedUser = await updateUser(user, id);
  return res.json(updatedUser).status(200);
});

router.post("/verify", requiresAuthentication, async (req, res) => {
  const username = getUsernameFromJWT(req.cookies.authToken);
  try {
    const user = await authenticateUser(username, req.body.password);
    if (user) {
      return res.status(200).json({ message: "Valid credentials" });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
});

router.post("/checkUsernameUnique", async (req, res) => {
  const username = req.body.username;
  const result = await checkUserExists(username);
  if (result) {
    return res.status(400).json({ error: "Username already exists" });
  } else {
    return res.status(200).json({ message: "Username is unique" });
  }
});


export default router;
