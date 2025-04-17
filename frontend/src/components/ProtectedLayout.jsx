import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const ProtectedLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <>
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} />
        <div className="flex-1 ml-0 transition-all">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default ProtectedLayout;