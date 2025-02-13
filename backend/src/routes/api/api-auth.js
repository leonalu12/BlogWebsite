import express from "express";
import { authenticateUser } from "../../data/user-dao.js";
import { createUserJWT } from "../../data/jwt-util.js";
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await authenticateUser(username, password);  // Verify username and password
    if (user) {
      console.log(username);
      const userToken = createUserJWT(username);   // Generate JWT token for authentication
      console.log("got token", userToken);
      return res.cookie("authToken", userToken, {   // Store in Cookies (httpOnly: true to prevent frontend JavaScript access)
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: "/"
      }).json({ username });  // Return username (for frontend display)
    } else {
      console.log("wrong username or password");
      return res.sendStatus(401);
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.post("/update", async (req, res) => {  // Used to update authToken (e.g., after user information is modified)
  try {
    const { username } = req.body;
    if (username) {
      const userToken = createUserJWT(username);  // Generate new token with just the username
      return res.cookie("authToken", userToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: "/"
      }).json({ username });
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.delete("/", (req, res) => {  // Clear authToken to invalidate requiresAuthentication
  return res.cookie("authToken", "", {  // Clear authToken Cookie (expire it)
    expires: new Date(0),
  }).sendStatus(204);
});

router.get("/check", (req, res) => {  // Check if authToken exists
  if (req.cookies.authToken) {
    return res.sendStatus(200);
  } else {
    return res.sendStatus(401);
  }
});

export default router;