import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobile } from '../context/MobileContext';
import { Calendar, Package, ChevronRight, Filter, X, Check } from 'lucide-react';

const PickupLogs = () => {
  const { logs, scheduleNewPickup } = useMobile();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  
  // Modal booking form state
  const [selectedMaterial, setSelectedMaterial] = useState('Household Garbage');
  const [selectedDate, setSelectedDate] = useState('Oct 29');
  const [selectedTime, setSelectedTime] = useState('09:00 AM - 11:00 AM');

  // Filter logs dynamically based on filter category tab
  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'All') return true;
    return log.type.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    scheduleNewPickup(selectedDate, selectedTime, selectedMaterial);
    setIsScheduleOpen(false);
  };

  const getMaterialColor = (type) => {
    const t = type.toLowerCase();
    if (t.includes('garbage')) return 'text-slate-500 bg-slate-50 border-slate-100';
    if (t.includes('plastic')) return 'text-blue-500 bg-blue-50 border-blue-100';
    if (t.includes('paper')) return 'text-amber-500 bg-amber-50 border-amber-100';
    if (t.includes('bulky')) return 'text-red-500 bg-red-50 border-red-100';
    return 'text-slate-500 bg-slate-50 border-slate-100';
  };

  return (
    <div className="space-y-6 px-1 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500 bg-slate-50 min-h-screen">
      
      <header className="flex justify-between items-center pt-4">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">History</span>
          <h1 className="text-2.5xl font-black text-slate-800 tracking-tight">Pickup Logs</h1>
        </div>
        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-500 cursor-pointer active:scale-95 transition-transform flex items-center gap-1">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-600">Filters</span>
        </div>
      </header>

      {/* Booking CTA Button (Schedule Collection) */}
      <button 
        onClick={() => setIsScheduleOpen(true)}
        className="w-full bg-white border border-emerald-100 p-4.5 rounded-2xl flex items-center justify-between group active:scale-[0.99] transition-transform cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-3.5 text-left">
          <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs.5 uppercase tracking-wide">Schedule Waste Pickup</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Book our next available collection truck</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1.5 transition-transform stroke-[2.2px]" />
      </button>

      {/* Filter Tabs menu */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-0.5">
        {['All', 'Garbage', 'Plastic', 'Paper', 'Bulky'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${activeFilter === tab ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Logs list section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Disposal History</span>
          <span className="text-[10px] font-bold text-slate-500">{filteredLogs.length} entries</span>
        </div>

        <div className="space-y-2.5">
          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.05 }}
                className="bg-white border border-slate-200/60 rounded-xl p-4 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${getMaterialColor(log.type)}`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-xs.5">{log.type} Collection</h4>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{log.date}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs.5 font-black text-emerald-600 tracking-tight">{log.points} pts</span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{log.weight || '1.8kg'}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredLogs.length === 0 && (
            <div className="text-center py-10 space-y-2.5 bg-white border border-slate-200/60 rounded-xl">
              <Package className="w-8 h-8 text-slate-350 mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">No waste collection logs found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Beautiful Modal Bottom Booking Drawer */}
      <AnimatePresence>
        {isScheduleOpen && (
          <>
            {/* Dark modal overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />

            {/* Bottom Drawer details */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[36px] z-50 border-t border-slate-100 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] p-6 pb-8 space-y-6"
            >
              {/* Header drawer controls */}
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-black text-slate-800 text-lg tracking-tight">Schedule Waste Pickup</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fill in collection details</p>
                </div>
                <button 
                  onClick={() => setIsScheduleOpen(false)}
                  className="p-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.2px]" />
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4.5">
                
                {/* Form Row: Waste category selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">Waste Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Household Garbage',
                      'Plastic & Bottles',
                      'Paper & Cardboard',
                      'Large Bulky Waste'
                    ].map((mat) => (
                      <button
                        type="button"
                        key={mat}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${selectedMaterial === mat ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-50' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Row: Date selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">Select Date</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Oct 29', 'Oct 30', 'Oct 31'].map((date) => (
                      <button
                        type="button"
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${selectedDate === date ? 'border-emerald-500 bg-emerald-50/15 text-emerald-600 font-black ring-2 ring-emerald-50' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
                      >
                        <span className="block text-[11px] font-bold">{date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Row: Hour selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-0.5">Preferred Time Window</label>
                  <div className="space-y-2">
                    {[
                      '09:00 AM - 11:00 AM',
                      '11:00 AM - 01:00 PM',
                      '02:00 PM - 04:00 PM'
                    ].map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${selectedTime === time ? 'border-emerald-500 bg-emerald-50/15 text-emerald-600' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-250'}`}
                      >
                        <span className="text-[10.5px] font-bold">{time}</span>
                        {selectedTime === time && (
                          <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[2.5px]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <button 
                  type="submit"
                  className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest text-white rounded-2.5xl flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Calendar className="w-4.5 h-4.5" />
                  Confirm Waste Pickup
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PickupLogs;
