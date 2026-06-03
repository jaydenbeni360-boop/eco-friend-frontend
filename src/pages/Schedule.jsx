import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';
import { Calendar, ArrowRight } from 'lucide-react';

const Schedule = () => {
  const navigate = useNavigate();
  const { scheduleNewPickup } = useMobile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [wasteType, setWasteType] = useState('Household Waste');
  const [price, setPrice] = useState(0);
  const [streetNumber, setStreetNumber] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');

  const handleWasteTypeChange = (e) => {
    const type = e.target.value;
    setWasteType(type);
    // price is determined by admin after weighing; keep 0 for user
    setPrice(0);
  };

  const [locating, setLocating] = useState(false);
  const USE_DEVICE_GEO = import.meta.env.VITE_USE_DEVICE_GEO === 'true'; // set to 'false' for testing

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !streetNumber || !gateNumber) return;
    
    setLocating(true);
    const address = `Street ${streetNumber}, Gate ${gateNumber}${apartment ? `, ${apartment}` : ''}${landmark ? ` (Near ${landmark})` : ''}`;

    // Get exact location using browser geolocation
    let latitude = null;
    let longitude = null;
    try {
      if (USE_DEVICE_GEO) {
        const position = await new Promise((resolve, reject) => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          } else {
            reject(new Error('Geolocation not supported'));
          }
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } else {
        // Device geolocation disabled for testing — use school coords
        latitude = -1.967308;
        longitude = 30.227309;
      }
    } catch (err) {
      // Fallback: use school coordinates
      latitude = -1.967308;
      longitude = 30.227309;
    }

    // User doesn't supply weight/price anymore — admin will measure and set amount
    const result = await scheduleNewPickup(date, time, wasteType, null, 0, address, latitude, longitude);
    setLocating(false);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      alert(result?.message || 'Failed to schedule pickup. Please try again.');
    }
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
              onChange={handleWasteTypeChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option>Household Waste</option>
              <option>Bulky Waste</option>
              <option>Recyclable Waste</option>
              <option>Electronic Waste</option>
            </select>
          </div>
          {/* Weight removed from user UI; admin will set weight/price */}
          {/* Price is shown to admin/collectors; hide from user UI */}
          <div className="border-t-2 border-slate-100 pt-4">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Delivery Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="streetNumber">
                  Street Number *
                </label>
                <input
                  id="streetNumber"
                  type="text"
                  required
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  placeholder="e.g., 123"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="gateNumber">
                  Gate Number *
                </label>
                <input
                  id="gateNumber"
                  type="text"
                  required
                  value={gateNumber}
                  onChange={(e) => setGateNumber(e.target.value)}
                  placeholder="e.g., A1"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="apartment">
                  Apartment/Unit
                </label>
                <input
                  id="apartment"
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1" htmlFor="landmark">
                  Landmark
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{locating ? 'Locating & Scheduling...' : 'Schedule'}</span>
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
