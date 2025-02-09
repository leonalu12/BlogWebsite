import { getUsersByUsername } from "../data/user-dao.js";
import { getUsernameFromJWT } from "../data/jwt-util.js";


export async function requiresAuthentication(req, res, next) {

  if(req.cookies.authToken){  //检查autoToken是否存在（存于cookies）

    try {    //JSON Web Token (JWT)，其中包含 username、user_id 等信息
      const username = getUsernameFromJWT(req.cookies.authToken);   //解析 JWT，获取 username
      console.log(username);
      const user = await getUsersByUsername(username);   //查询数据库，验证 username 是否有效
      if (user) {
        req.user = user;        //如果成功，赋值 req.user，继续执行后续代码
        return next();
      } else {
        return res.sendStatus(401);
      }
    } catch (error) {
      return res.sendStatus(401);
    }
  } else {
    return res.sendStatus(401);        //如果失败，返回 401（未授权）
  }
}