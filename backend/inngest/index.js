import { Inngest } from "inngest";
import User from "../Models/User.js";

export const inngest = new Inngest({ id: "pingup-app" });

//Inngest FUnction to save user details to DB

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clear/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    let username = email_addresses[0].email_addresses.split("@")[0];

    const user = await User.findOne({ username });
    if (user) {
      user = username + Math.floor(Math.random() * 10000);
    }
    const userData = {
      _id: id,
      email: email_addresses[0].email_addresses,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
      username,
    };
    await User.create(userData);
  }
);
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clear/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const updatedUserdata = {
      email: email_addresses[0].email_addresses,
      full_name: first_name + " " + last_name,
      profile_picture: image_url,
    };
    await User.findByIdAndUpdate(id, updatedUserdata);
  }
);
const syncUserDelete = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clear/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await User.findByIdAndDelete(id);
  }
);

export const functions = [syncUserCreation,
   syncUserUpdate,
    syncUserDelete];
