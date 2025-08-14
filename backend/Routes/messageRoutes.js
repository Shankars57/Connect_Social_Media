import express from 'express';
import { getChatMessages, sendMessage, serverSide } from '../controllers/MessageController.js';
import { upload } from '../Config/multer.js';
import { protect } from '../Middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get("/:userId" , serverSide)
messageRouter.post("/send" , upload.single('image'), protect ,sendMessage);

messageRouter.post('/get' , protect ,getChatMessages)


export default messageRouter;