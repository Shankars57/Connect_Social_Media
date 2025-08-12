import { Inngest } from "inngest";
import User from "../Models/User.js";
import { connectDB } from "../DB/Database.js";
import Connection from "../Models/Connection.js";
import sendEmail from "../Config/nodemailer.js";

export const inngest = new Inngest({ id: "pingup-app" });

// Create user
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      public_metadata,
    } = event.data;

    let username =
      email_addresses?.[0]?.email_address?.split("@")[0] ||
      `user_${Date.now()}`;
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

    const {
      id,
      first_name,
      last_name,
      email_addresses,
      image_url,
      public_metadata,
    } = event.data;

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

//Inngest Function to send Reminder when a new connection request is added

const sendNewConnectionRequestReminder = inngest.createFunction(
  { id: "send-new-connection-request-reminder" },
  { event: "app/connection-request" },
  async ({ event, step }) => {
    const { connectionId } = event.data;
    await step.run("send-connection-request-email", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );
      const subject = `👋  New Connection Request `;

      const body = `
      <div style="font-family:Arial,sans-serif ; padding:20px;">
      <h2>Hi ${connection.to_user_id.full_name},</h2>

       <p>You  have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
       <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981">Here</a> to accept or reject the request  </p>

      <br />
      <p>Thanks ,<br /> PingUp - stay Connected</p>
      
      
      </div>`;

      await sendEmail({ to: connection.to_user_id.email, subject, body });
    });

    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await step.sleepUntil("wait-for-24-hours", in24Hours);
    await step.run("send-connection-request-remainder", async () => {
      const connection = await Connection.findById(connectionId).populate(
        "from_user_id to_user_id"
      );
      if (connection.status === "accepted") {
        return { message: "Already accepted" };
      }

      const subject = `👋  New Connection Request `;

      const body = `
      <div style="font-family:Arial,sans-serif ; padding:20px;">
      <h2>Hi ${connection.to_user_id.full_name},</h2>

       <p>You  have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
       <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981">Here</a> to accept or reject the request  </p>

      <br />
      <p>Thanks ,<br /> PingUp - stay Connected</p>
      
      
      </div>`;

      await sendEmail({ to: connection.to_user_id.email, subject, body });
    });
    return { message: "Request sent" };
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdate,
  syncUserDelete,
  sendNewConnectionRequestReminder,
];
