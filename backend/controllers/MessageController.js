import fs from "fs";
import { imagekit } from "../Config/images.js";
import Message from "../Models/message.js";

const connections = {};

export const serverSide = (req, res) => {
  const { userId } = req.params;

  console.log("New Client Connected", userId);

  //set sse headers

  res.setHeaders("Content-Type", "text/event-stream");
  res.setHeaders("Cache-Control", "no-cache");
  res.setHeaders("Connection", "keep-alive");
  res.setHeaders("Access-Control-Allow-Origin", "*");

  connections[userId] = res;

  res.write("log:Connected to SSE stream \n\n");

  req.on("close", () => {
    delete connections[userId];
    console.log("Client disconnected");
  });
};

//Send Message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;
    let media_url = "";
    let message_type = image ? "image" : "text";
    if (message_type === "image") {
      const buffer = fs.readFileSync(image.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: image.originalname,
      });

      media_url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }
    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      message_type,
      text,
      media_url,
    });
    res.json({ success: true, message });

    //send message to user
    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id"
    );
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify(messageWithUserData)}\n\n`
      );
    }
  } catch (error) {
    res.json({ success: false, message: error });
  }
};

//Get chat Messages

export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, userId },
      ],
    }).sort({ createdAt: -1 });

    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: true, message: error.message });
  }
};

export const getRecentMessages = async(req,res)=>{
  try {


       const {userId} = req.auth();

       const messages = await Message.find({to_user_id:userId}).populate("from_user_id to_user_id").sort({createdAt:-1})

 res.json({ success: true, messages });

    
  } catch (error) {

     res.json({ success: true, message: error.message });
    
  }
}
