import { ArrowLeft, Sparkle, TextIcon, Upload } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

const StoryModel = ({ setShowModel, fetchStories }) => {
  const bg_colors = [
    "#4f46e5",
    "#7c3aed",
    "#db2777",
    "#e11d48",
    "#ca8a04",
    "#0d9488",
  ];
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [bg, setBG] = useState(bg_colors[0]);

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleCreateStory = async () => {};
  return (
    <div
      className="fixed 
  inset-0 z-100 min-h-screen
   bg-black/80 backdrop-blur
    text-white flex items-center
   justify-center p-4 "
    >
      <div className="w-full max-w-md ">
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowModel(false)}
            className="text-white p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>
        <div
          className="rounded-lg h-96
           flex items-center justify-center relative "
          style={{ backgroundColor: bg }}
        >
          {mode === "text" && (
            <textarea
              name=""
              className="bg-transparent 
            text-white
             w-full h-full 
             p-6
              text-lg
              resize-none
             focus:outline-none"
              id=""
              placeholder="what's on your mind ?"
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}
          {mode === "media" &&
            previewUrl &&
            (media?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt=" "
                className="object-contain max-h-full"
              />
            ) : (
              <video
                src={previewUrl}
                className="object-contain max-h-full"
                controls
              />
            ))}
        </div>

        <div className="flex mt-4 gap-2">
          {bg_colors.map((col, i) => (
            <button
              onClick={() => setBG(col)}
              key={i}
              className={`rounded-full w-6 h-6 ring cursor-pointer `}
              style={{ backgroundColor: col }}
            />
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          {/* Text Mode Button */}
          <button
            onClick={() => {
              setMode("text");
              setMedia(null); // not "null" string
              setPreviewUrl(null);
            }}
            className={`flex-1 flex 
      cursor-pointer items-center
      justify-center gap-2 py-1 px-2 rounded ${
        mode === "text" ? "bg-white text-black" : "bg-zinc-800"
      }`}
          >
            <TextIcon size={18} /> Text
          </button>

          {/* Media Upload Button */}
          <label
            htmlFor="media-upload"
            className={`flex-1 flex 
      cursor-pointer items-center
      justify-center gap-2 py-1 px-2 rounded ${
        mode === "media" ? "bg-white text-black" : "bg-zinc-800"
      }`}
          >
            <Upload size={18} /> Photo/Video
          </label>

          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={(e) => {
              handleMediaUpload(e);
              setMode("media");
            }}
          />
        </div>

        <button
          onClick={() => {
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
              success: <p>Stroy added</p>,
              error: (e) => <p>{e.message}</p>,
            });
            setShowModel(false);
          }}
          className="flex items-center justify-center gap-2 text-white py-3 mt-4 w-full
          rounded bg-gradient-to-r from-indigo-500 to-purple-600 
          hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer"
        >
          <Sparkle size={18} />
          create story
        </button>
      </div>
    </div>
  );
};

export default StoryModel;
