import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { dummyUserData } from "../assets/assets";
import Loading from "../components/Loading";

const Layouts = () => {
  const user = dummyUserData;
  const [open, setOpen] = useState(false);

  return user ? (
    <div className="w-full flex h-screen relative">
      <div className="hidden sm:block">
        <Sidebar setOpen={setOpen} />
      </div>
      {open && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white shadow-md">
          <Sidebar setOpen={setOpen} />
        </div>
      )}

      <div className="flex-1 bg-slate-50 overflow-y-auto">
     
        <div className="sm:hidden absolute top-3 right-3 z-50">
          {open ? (
            <X
              onClick={() => setOpen(false)}
              className="p-2 bg-black rounded-md shadow w-10 h-10 text-white"
            />
          ) : (
            <Menu
              onClick={() => setOpen(true)}
              className="p-2 bg-black rounded-md shadow w-10 h-10 text-white"
            />
          )}
        </div>

        <Outlet />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Layouts;
