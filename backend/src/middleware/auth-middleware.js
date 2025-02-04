import { getUsersByUsername } from "../data/user-dao.js";
import { getUsernameFromJWT } from "../data/jwt-util.js";


export async function requiresAuthentication(req, res, next) {

  if(req.cookies.authToken){

    try {
      const username = getUsernameFromJWT(req.cookies.authToken);
      console.log(username);
      const user = await getUsersByUsername(username);
      if (user) {
        req.user = user;
        return next();
      } else {
        return res.sendStatus(401);
      }
    } catch (error) {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);
  }
}
