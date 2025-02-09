import express from "express";
import { authenticateUser } from "../../data/user-dao.js";
import { createUserJWT} from "../../data/jwt-util.js";
const router = express.Router();

router.post("/", async (req, res) => {

try{
    const{username,password}=req.body;
    console.log(req.body);
    const user = await authenticateUser(username,password);  //验证用户名和密码
    if((user)){
      console.log(username);
      const userToken =createUserJWT(username);   //生成 JWT 令牌，用于身份验证
      console.log("got token",userToken);
      return res.cookie("authToken",userToken,{   //存入 Cookies (httpOnly: true，防止前端 JavaScript 访问)
        httpOnly:true,
        expires: new Date(Date.now() + 24*60*60*1000),
        path : "/"
      }).json({username})  //返回 username（用于前端显示）
    }else{
      console.log("wrong username or password");
      return res.sendStatus(401);
    }
  }catch(error){
    console.error(error);
    return res.sendStatus(500);
  }
});

router.post("/update", async (req, res) => {  //用于更新 authToken（例如，用户修改信息后）
  try {
    const {username} = req.body;
    if (username) {
      const userToken = createUserJWT(username);  //只需要 username 就能生成新令牌
      return res.cookie("authToken", userToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 24*60*60*1000),
        path: "/"
      }).json({username});
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});


router.delete("/", (req, res) => {  //清除 authToken，让 requiresAuthentication 失效

        return res.cookie("authToken","",{  //清除 authToken Cookie（令其过期）
          expires:new Date(0),
        }).sendStatus(204);

  });



export default router;