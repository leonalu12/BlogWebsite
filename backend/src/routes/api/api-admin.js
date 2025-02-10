import express from "express";
import { authenticateAdmin} from "../../data/admin-dao.js";
import { getUsers } from "../../data/user-dao.js";
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

export default router;