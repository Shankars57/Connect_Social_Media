import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { dummyPostsData, dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";
import { Link } from "react-router-dom";
import moment from "moment";
import EditProfile from "../components/EditProfile";
const Profile = () => {
  const { profileId } = useParams();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const prevIndex = useRef(0);
  const tabs = ["posts", "media", "likes"];

  const handleTabClick = (tab) => {
    prevIndex.current = tabs.indexOf(activeTab);
  };

  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white
        rounded-2xl
        shadow overflow-hidden"
        >
          <div
            className="h-40 md:h-56 bg-gradient-to-r from-indigo-200
             via-purple-200 to-pink-200"
          >
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>
        <div className="mt-6">
          {/*Tabs */}
          <div
            className="bg-white
           rounded-xl shadow px-1 
           flex max-w-md mx-auto "
          >
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 relative px-4 py-2 z-100 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab && "text-white"
                } `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="-z-1 rounded-lg absolute text-white bg-indigo-800 p-4 w-full -h-full inset-0"
                  ></motion.div>
                )}
              </button>
            ))}
          </div>
          {/* Post */}

          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
          {activeTab === "media" && (
            <div className="mt-6 flex flex-row items-center gap-2 rounded p-2 shadow-xl max-w-6xl">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post, i) => (
                  <>
                    {post.image_urls.map((img, i) => (
                      <Link
                        key={i}
                        target="_blank"
                        to={img}
                        className="relative group "
                      >
                        <img
                          src={img}
                          key={i}
                          className="w-64 aspect-video object-cover rounded-lg"
                          alt=""
                        />
                        <p
                          className="absolute bottom-0 right-0 text-xs p-1 px-2 backdrop-blur-xl
                         text-white opacity-0 group-hover:opacity-100
                          transition duration-300"
                        >
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </>
                ))}
            </div>
          )}
        </div>
      </div>
      {/*Edit profile */}
      {showEdit && <EditProfile setShowEdit={setShowEdit} />}
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
