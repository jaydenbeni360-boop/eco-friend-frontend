// src/components/SideDrawer.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, Menu, Trash2, Camera, Clock, Calendar, Info, LogOut } from 'lucide-react';
import { useMobile } from '../context/MobileContext';

export const SideDrawer = () => {
  const [open, setOpen] = useState(false);
  const { logoutUser } = useMobile();
  const navigate = useNavigate();

  const toggleDrawer = () => setOpen(!open);
  const closeDrawer = () => setOpen(false);

  const handleLogout = () => {
    logoutUser();
    closeDrawer();
    navigate('/login');
  };

  const linkClass = "flex items-center gap-3 py-3.5 px-5 text-sm font-semibold text-slate-600 hover:text-emerald-500 hover:bg-slate-50 transition-all rounded-xl mx-2";
  const activeClass = "text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50/50";

  return (
    <>
      {/* Hamburger button */}
      <button
        aria-label="Toggle navigation"
        onClick={toggleDrawer}
        className="fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm active:scale-95 transition-transform"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } z-50 flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden p-0.5">
              <img src="/copilot_ 20260525_085633.png" alt="E" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-base font-black text-slate-800 tracking-tight">ECO FRIEND</h2>
          </div>
          <button 
            onClick={closeDrawer} 
            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-100"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="mt-4 flex-grow space-y-1">
          <NavLink
            to="/dashboard"
            onClick={closeDrawer}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Trash2 className="w-4.5 h-4.5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/scanner"
            onClick={closeDrawer}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Camera className="w-4.5 h-4.5" />
            <span>Scan Bin</span>
          </NavLink>
          
          <NavLink
            to="/logs"
            onClick={closeDrawer}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Clock className="w-4.5 h-4.5" />
            <span>Pickup Logs</span>
          </NavLink>
          
          <NavLink
            to="/schedule"
            onClick={closeDrawer}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>Schedule</span>
          </NavLink>
          
          <NavLink
            to="/about"
            onClick={closeDrawer}
            className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
          >
            <Info className="w-4.5 h-4.5" />
            <span>About</span>
          </NavLink>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-3.5 px-5 text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all rounded-xl mx-2 mt-6 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Logout</span>
          </button>
        </nav>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ECO FRIEND MOBILE v1.2</p>
        </div>
      </aside>
    </>
  );
};
