import express from "express";
import {
  addPost,
  getFeedPost,
  likePost,
} from "../controllers/PostController.js";
import { protect } from "../Middleware/auth.js";
import { upload } from "../Config/multer.js";
const postRouter = express.Router();

postRouter.post("/add", upload.array("images", 4), protect, addPost);
postRouter.get("/feed", protect, getFeedPost);
postRouter.post("/like", protect, likePost);

export default postRouter;
