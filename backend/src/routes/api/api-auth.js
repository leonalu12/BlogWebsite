import express from "express";
import { authenticateUser } from "../../data/user-dao.js";
import { createUserJWT} from "../../data/jwt-util.js";
const router = express.Router();

router.post("/", (req, res) => {
    const{username,password}=req.body;
    console.log(req.body);
    if(authenticateUser(username,password)){
      console.log(username);
      const userToken =createUserJWT(username);
      return res.cookie("authToken",userToken,{
        httpOnly:true,
        expires: new Date(Date.now() + 24*60*60*1000),
        path : "/"
      }).json({username})
    }else{
      return res.sendStatus(401);
    }
});


router.delete("/", (req, res) => {

        return res.cookie("authToken","",{
          expires:new Date(0),
        }).sendStatus(204);

  });

export default router;