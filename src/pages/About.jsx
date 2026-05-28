import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Award, ShieldCheck, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen px-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500 bg-slate-50 font-sans">
      
      {/* Header */}
      <header className="mb-6 flex items-center gap-3.5 pt-4">
        <Link to="/dashboard" className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Application</span>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight font-heading">About Eco Friend</h1>
        </div>
      </header>

      {/* Main Card Grid (Bento style) */}
      <div className="space-y-4">
        {/* Big Premium Banner */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-[0_12px_30px_rgba(16,185,129,0.2)] relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-teal-400/20 rounded-full blur-xl" />
          
          <Leaf className="w-10 h-10 mb-4 opacity-90 stroke-[2.2px]" />
          <h2 className="text-xl font-bold font-heading mb-2">Our Greener Mission</h2>
          <p className="text-xs text-emerald-50/95 leading-relaxed font-light">
            Eco Friend is designed to revolutionize personal waste management. We connect technology, local communities, and active green rewards to make recycling intuitive and satisfying.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm space-y-2">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100/50">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 font-heading">Earn Points</h3>
            <p className="text-[10.5px] text-slate-500 leading-normal">
              Earn points for every clean pickup or smart bin QR code verification.
            </p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm space-y-2">
            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800 font-heading">Secure & Fast</h3>
            <p className="text-[10.5px] text-slate-500 leading-normal">
              Direct verification using advanced QR scanner technology.
            </p>
          </div>
        </div>

        {/* Core Info */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 font-heading">Features At A Glance</h3>
          
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="text-xs">
                <strong className="text-slate-700 block font-medium">Real-Time Dispatch Map</strong>
                <span className="text-slate-500">Track active trucks as they approach your address.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="text-xs">
                <strong className="text-slate-700 block font-medium">Smart Scheduling</strong>
                <span className="text-slate-500">Choose convenient date & time slots for home waste collection.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div className="text-xs">
                <strong className="text-slate-700 block font-medium">Clean Score Statistics</strong>
                <span className="text-slate-500">Keep history records of all recycled waste weights and rewards.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 space-y-2">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for a Cleaner Planet
          </p>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
            Version 1.2.0
          </span>
        </div>
      </div>
    </div>
  );
};

export default About;
