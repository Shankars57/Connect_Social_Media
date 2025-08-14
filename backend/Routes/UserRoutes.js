import express from "express";
import { getRecentMessages } from "../controllers/MessageController.js";
import {
  acceptConnectionRequest,
  discoverUsers,
  followUsers,
  getUserConnections,
  getUserData,
  getUserProfiles,
  sendConnectionRequest,
  unFollowUser,
  updateUserData,
} from "../controllers/UserController.js";
import { protect } from "../Middleware/auth.js";
import { upload } from "../Config/multer.js";
const userRouter = express.Router();

userRouter.get("/data", protect, getUserData);
userRouter.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData
);
userRouter.post("/discover", protect, discoverUsers);
userRouter.post("/follow", protect, followUsers);
userRouter.post("/unfollow", protect, unFollowUser);
userRouter.post("/connect", protect, sendConnectionRequest);
userRouter.post("/accept", protect, acceptConnectionRequest);
userRouter.get("/connections", protect, getUserConnections);
userRouter.post("/profiles", getUserProfiles);
userRouter.get("/recent-messages", protect, getRecentMessages);

export default userRouter;
