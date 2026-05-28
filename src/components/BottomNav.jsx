import { NavLink } from 'react-router-dom';
import { LayoutDashboard, QrCode, ClipboardList } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="absolute bottom-0 left-0 w-full bottom-nav flex justify-around items-center h-22 px-6 z-40 pb-5 bg-white/95 backdrop-blur-md border-t border-slate-100 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.02)]">
      {/* Dashboard Nav link */}
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `flex flex-col items-center justify-center gap-1 group py-2 px-4 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {({ isActive }) => (
          <>
            <LayoutDashboard className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[10px] font-semibold tracking-wider transition-all">Dash</span>
            <div className={`w-1.5 h-1.5 rounded-full bg-primary mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
          </>
        )}
      </NavLink>

      {/* Verification Scanner Nav link */}
      <div className="relative -top-6 flex items-center justify-center">
        <div className="absolute w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <NavLink 
          to="/scanner" 
          className={({ isActive }) => `relative flex items-center justify-center bg-gradient-to-br from-primary to-emerald-600 p-4 rounded-full text-white shadow-[0_12px_24px_rgba(16,185,129,0.35)] border-4 border-white transition-all duration-300 hover:scale-105 active:scale-95 ${isActive ? 'scale-105 ring-4 ring-emerald-100' : ''}`}
        >
          <QrCode className="w-8 h-8 stroke-[2.2px] animate-pulse-slow" />
        </NavLink>
      </div>

      {/* Logs Nav link */}
      <NavLink 
        to="/logs" 
        className={({ isActive }) => `flex flex-col items-center justify-center gap-1 group py-2 px-4 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {({ isActive }) => (
          <>
            <ClipboardList className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
            <span className="text-[10px] font-semibold tracking-wider transition-all">Logs</span>
            <div className={`w-1.5 h-1.5 rounded-full bg-primary mt-0.5 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default BottomNav;
