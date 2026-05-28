import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';
import { Calendar, ArrowRight } from 'lucide-react';

const Schedule = () => {
  const navigate = useNavigate();
  const { scheduleNewPickup } = useMobile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [wasteType, setWasteType] = useState('General Waste');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) return;
    scheduleNewPickup(date, time, wasteType);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-extrabold text-emerald-600 text-center flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule a Pickup
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="time">
              Time
            </label>
            <input
              id="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="wasteType">
              Waste Type
            </label>
            <select
              id="wasteType"
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option>Household Waste</option>
              <option>Bulky Waste</option>
              <option>Recyclable Waste</option>
              <option>Electronic Waste</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            <span>Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-sm text-slate-500">
          Need to go back? <Link to="/dashboard" className="text-emerald-600 font-semibold hover:underline">Dashboard</Link>
        </p>
      </div>
    </div>
  );
};

export default Schedule;
