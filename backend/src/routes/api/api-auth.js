import express from "express";
import { authenticateUser } from "../../data/user-dao.js";
import { createUserJWT} from "../../data/jwt-util.js";
const router = express.Router();

router.post("/", async (req, res) => {

try{
    const{username,password}=req.body;
    console.log(req.body);
    const user = await authenticateUser(username,password);
    if((user)){
      console.log(username);
      const userToken =createUserJWT(username);
      console.log("got token",userToken);
      return res.cookie("authToken",userToken,{
        httpOnly:true,
        expires: new Date(Date.now() + 24*60*60*1000),
        path : "/"
      }).json({username})
    }else{
      console.log("wrong username or password");
      return res.sendStatus(401);
    }
  }catch(error){
    console.error(error);
    return res.sendStatus(500);
  }
});

router.post("/update", async (req, res) => {
  try {
    const {username} = req.body;
    if (username) {
      const userToken = createUserJWT(username);
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


router.delete("/", (req, res) => {

        return res.cookie("authToken","",{
          expires:new Date(0),
        }).sendStatus(204);

  });



export default router;