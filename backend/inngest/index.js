import { Inngest } from "inngest";
import User from "../Models/User.js";
import { connectDB } from "../DB/Database.js";

export const inngest = new Inngest({ id: "pingup-app" });

// Create user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url, public_metadata } = event.data;

    let username = email_addresses?.[0]?.email_address?.split("@")[0] || `user_${Date.now()}`;
    if (await User.findOne({ username })) {
      username += Math.floor(Math.random() * 10000);
    }

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      full_name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      profile_picture: image_url || "",
      username,
      location: public_metadata?.location || "Unknown",
    };

    await User.create(userData);
  }
);

// Update user
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB();

    const { id, first_name, last_name, email_addresses, image_url, public_metadata } = event.data;

    const updatedUserdata = {
      email: email_addresses?.[0]?.email_address || "",
      full_name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      profile_picture: image_url || "",
      location: public_metadata?.location || "Unknown",
    };

    await User.findByIdAndUpdate(id, updatedUserdata);
  }
);

// Delete user
const syncUserDelete = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

export const functions = [syncUserCreation, syncUserUpdate, syncUserDelete];
