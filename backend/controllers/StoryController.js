import { imagekit } from "../Config/images.js";
import Story from "../Models/story.js";
import fs from "fs";
import User from "../Models/User.js";
import { inngest } from "../inngest/index.js";

export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { content, media_type, background_color } = req.body;
    const media = req.file;

    let media_url = "";

    if (media_type === "image" || media_type === "video") {
      const buffer = fs.readFileSync(media.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: media.originalname,
      });
      media_url = response.url;
    }

    const story = await Story.create({
      user: userId,
      content,
      media_type,
      media_url,
      background_color,
    });

    await inngest.send({
        name:'app/story.delete',
        data:{storyId:story._id}
    })

    res.json({ success: true });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    //User connection and followings

    const userIds = [userId, ...user.connections, ...user.following];

    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (error) {
    res.json({ success: true, message: error.message });
  }
};
