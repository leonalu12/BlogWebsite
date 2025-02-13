import { getUsersByUsername } from "../data/user-dao.js";
import { getUsernameFromJWT } from "../data/jwt-util.js";

export async function requiresAuthentication(req, res, next) {

  if(req.cookies.authToken){  // Check if authToken exists in cookies

    try {    // JSON Web Token (JWT), which contains username, user_id, etc.
      const username = getUsernameFromJWT(req.cookies.authToken);   // Parse JWT to get username
      console.log(username);
      const user = await getUsersByUsername(username);   // Query the database to verify if the username is valid
      if (user) {
        req.user = user;        // If successful, assign req.user and continue executing subsequent code
        return next();
      } else {
        return res.sendStatus(401);
      }
    } catch (error) {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);        // If failed, return 401 (Unauthorized)
  }
}