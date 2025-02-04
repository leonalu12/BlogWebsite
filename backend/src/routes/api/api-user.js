import express from "express";
import { createUser,getUsersByUsername,deleteUser,updateUser,getUsers} from "../../data/user-dao.js";
import {requiresAuthentication} from "../../middleware/auth-middleware.js";

const router = express.Router();


router.get("/", requiresAuthentication, async (req, res) => {
  const username = req.query.username;
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

router.patch("/:id", requiresAuthentication, async (req, res) => {
  const id = req.params.id;
  const user = req.body;
  const updatedUser = await updateUser(user, id);
  return res.json(updatedUser);
});

export default router;
