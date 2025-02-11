import express from "express";
import { authenticateAdmin} from "../../data/admin-dao.js";
import { getUsers, deleteUser } from "../../data/user-dao.js";
import { deleteAdmin } from "../../data/admin-dao.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { username, pwd} = req.body;
  const admin = await authenticateAdmin(username,pwd);
  return res.json(admin); //null or admin
});

//users
router.get("/", async (req, res) => {
  try {
      const users = await getUsers();
      return res.json(users); // 返回用户数据
  } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

//delete admin
router.delete("/",async(req,res)=>{

    const {username} = req.body;
    await deleteAdmin(username);
    return res.sendStatus(204);

})

//delete user
//delete
router.delete("/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    const result = await deleteUser(userId);
    if (result) {
      return res.status(200).send('success');
    } else {
      return res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});


export default router;