import express from "express";
import { authenticateAdmin} from "../../data/admin-dao.js";
const router = express.Router();

router.get("/", async (req, res) => {
    const { username, pwd} = req.body;
  const admin = await authenticateAdmin(username,pwd);
  return res.json(admin); //null or admin
});
export default router;