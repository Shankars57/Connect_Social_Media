import mongoose from "mongoose";
import fs from "fs";
import User from "../Models/User.js";
import { imagekit } from "../Config/images.js";

/**
 * Get logged-in user's data
 */
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "No user found" });
    }

    console.log("Connected DB:", mongoose.connection.name);
    console.log("Collection Name:", User.collection.name);

    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * Update logged-in user's profile
 */
export const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { full_name, username, location, bio } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      return res.json({ success: false, message: "User not found" });
    }

    // Fallback to existing username if not provided
    if (!username) {
      username = tempUser.username;
    } else if (tempUser.username !== username) {
      const existing = await User.findOne({ username });
      if (existing) {
        return res.json({ success: false, message: "Username already taken" });
      }
    }

    const updatedData = {
      username,
      full_name,
      bio,
      location,
    };

    // Handle profile picture
    if (req.files?.profile?.[0]) {
      const profile = req.files.profile[0];
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      updatedData.profile_picture = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "512" },
        ],
      });
    }

    // Handle cover photo
    if (req.files?.cover?.[0]) {
      const cover = req.files.cover[0];
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: cover.originalname,
      });
      updatedData.cover_photo = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
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

/**
 * Discover users by search
 */
export const discoverUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
      ],
    });

    const filteredUsers = allUsers.filter((u) => u._id.toString() !== userId);

    return res.json({ success: true, users: filteredUsers });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * Follow a user
 */
export const followUsers = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    if (userId === id) {
      return res.json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: "Already following this user",
      });
    }

    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    if (toUser && !toUser.followers.includes(userId)) {
      toUser.followers.push(userId);
      await toUser.save();
    }

    return res.json({
      success: true,
      message: "You are now following this user",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * Unfollow a user
 */
export const unFollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.following = user.following.filter((u) => u.toString() !== id);
    await user.save();

    const toUser = await User.findById(id);
    if (toUser) {
      toUser.followers = toUser.followers.filter(
        (u) => u.toString() !== userId
      );
      await toUser.save();
    }

    return res.json({ success: true, message: "You unfollowed this user" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
