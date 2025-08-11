//Get user Data UserID
import fs from "fs";
import User from "../Models/User.js";
import { imagekit } from "../Config/images.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "No user founded" });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { full_name, username, location, bio } = req.body;
    const tempUser = await User.findById(userId);
    !username && (username = tempUser.username);
    if (tempUser.username !== username) {
      const user = User.findOne({ username });
      if (user) {
        user = tempUser.username;
      }
    }
    const updatedData = {
      username,
      full_name,
      bio,
      location,
    };

    const profile = req.files.profile && req.files.profile[0];
    const cover = req.files.cover && req.files.cover[0];

    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          {
            quality: "auto",
          },
          {
            format: "webp",
          },
          { width: "512" },
        ],
      });
      updatedData.profile_picture = url;
    }
    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          {
            quality: "auto",
          },
          {
            format: "webp",
          },
          { width: "1280" },
        ],
      });
      updatedData.cover_photo = url;
    }
    const user = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res.json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//Find Users using username , email ,location , name

export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        {
          username: new RegExp(input, "i"),
        },
        {
          email: new RegExp(input, "i"),
        },
        {
          full_name: new RegExp(input, "i"),
        },
        {
          location: new RegExp(input, "i"),
        },
      ],
    });
    const filteredUsers = allUsers.filter((user) => user._id != userId);

    return res.json({ success: true, users: filteredUsers });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Follow user
export const followUsers = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { id } = req.body;

    const user = await User.findById(userId);

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "You already following this user",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    return res.json({ success: true, message: "You following this user" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const unFollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();

    const { id } = req.body;

    const user = await User.findById(userId);

    user.following = user.following.filter((user) => user !== id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers = user.followers.filter((user) => user !== id);
    await toUser.save();

    return res.json({ success: true, message: "You are unFollow this user" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
