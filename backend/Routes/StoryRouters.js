import express from 'express';
import { upload } from '../Config/multer.js';
import { protect } from '../Middleware/auth.js';
import { addUserStory, getStories } from '../controllers/StoryController.js';

const storyRouter = express.Router();

storyRouter.post("/create" , upload.single('media'), protect,addUserStory)
storyRouter.get("/get" , protect,getStories)



export default storyRouter;