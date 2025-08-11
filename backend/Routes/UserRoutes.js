import express from 'express'
import { discoverUsers, followUsers, getUserData, unFollowUser, updateUserData } from '../controllers/UserController.js';
import {protect} from '../Middleware/auth.js'
import { upload } from '../Config/multer.js';
const userRouter = express.Router();

userRouter.get("/data", protect  , getUserData)
userRouter.post("/update" , upload.fields([{name:"profile" , maxCount:1},{name:"cover" , maxCount:1}]) , protect , updateUserData)  
userRouter.post("/discover" , protect , discoverUsers)
userRouter.post("/follow" , protect , followUsers)
userRouter.post("/unfollow" , protect , unFollowUser)

export default userRouter;