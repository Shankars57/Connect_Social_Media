import mongoose from "mongoose";
import fs from "fs";
import User from "../Models/User.js";
import { imagekit } from "../Config/images.js";
import Connection from "../Models/Connection.js";

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

//Send Connection Request

export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    //Only 20 connection in a day

    const last24hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const connectionRequest = await Connection.find({
      from_user_id: userId,
      created_at: { $gt: last24hours },
    });
    if (connectionRequest.length >= 20) {
      return res.json({
        success: false,
        message:
          "You've sent more than 20 connection requests in the last 24 hours.",
      });
    }

    const connection = await Connection.findOne({
      $or: [
        {
          from_user_id: userId,
          to_user_id: id,
        },
        {
          from_user_id: id,
          to_user_id: userId,
        },
      ],
    });

    if (!connection) {
      await connection.create({
        from_user_id: userId,
        to_user_id: id,
      });

      return res.json({ success: true, message: "Request send successful" });
    } else if (connection && connection.status == "accepted") {
      return res.json({
        success: false,
        message: "You are already connected with this user",
      });
    }
    return res.json({
      success: false,
      message: "You connection Request is in pending",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

//User connection

export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.auth();

    const user = await User.findById(userId).populate(
      "connections followers following"
    );
    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = await Connection.find({
      to_user_id: userId,
      status: "pending",
    })
      .populate("from_user_id")
      .map((connection) => connection.from_user_id);
    return res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};

//Accept the Request

export const getUserConnections = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });

    if (!connection) {
      return res.json({ success: false, message: "Connection nor found" });
    }

    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const to_user = await User.findById(id);
    to_user.connections.push(userId);
    await to_user.save();

    connection.status = "accepted";
    await connection.save();

    return res.json({
      success: true,
      message: "Connection accepted successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error,
    });
  }
};
