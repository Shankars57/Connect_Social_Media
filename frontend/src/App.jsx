import React, { Profiler } from "react";
import { Route, Routes } from "react-router-dom";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import ChatBox from "./pages/ChatBox";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Connection from "./pages/Connection";
import { useUser } from "@clerk/clerk-react";
import Layouts from "./pages/Layouts";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { user } = useUser();
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layouts />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="connections" element={<Connection />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
