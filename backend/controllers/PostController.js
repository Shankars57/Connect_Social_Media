import post from "../Models/Post.js";
import fs from "fs";
import { imagekit } from "../Config/images.js";
import User from "../Models/User.js";
export const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;
    let image_urls = [];

    if (images.length) {
      image_urls = await Promise.all(
        image_urls.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);

          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: "posts",
          });
          updatedData.cover_photo = imagekit.url({
            path: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: "1280" },
            ],
          });

          return url;
        })
      );
    }

    await post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    return res.json({ success: true, message: "Post created successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Get post

export const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await post
      .find({ user: { $in: userIds } })
      .populate("user")
      .sort({ created: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const likePost = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { postId } = req.body;

    const post = await post.findById(postId);
    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);

      await post.save();

      res.json({ success: true, message: "Like Removed" });
    } else {
      post.likes_count.push(userId);
      await post.save();

      res.json({ success: true, message: "Like Added" });
    }

    res.json({ success: true, });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
