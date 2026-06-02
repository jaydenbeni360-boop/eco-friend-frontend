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
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState(0);
  const [streetNumber, setStreetNumber] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');

  // Pricing per kg for each waste type
  const pricingRules = {
    'Household Waste': 2.50,
    'Bulky Waste': 5.00,
    'Recyclable Waste': 1.50,
    'Electronic Waste': 10.00
  };

  const calculatePrice = (w, type) => {
    const kg = parseFloat(w) || 0;
    const pricePerKg = pricingRules[type] || 2.50;
    return (kg * pricePerKg).toFixed(2);
  };

  const handleWeightChange = (e) => {
    const w = e.target.value;
    setWeight(w);
    setPrice(calculatePrice(w, wasteType));
  };

  const handleWasteTypeChange = (e) => {
    const type = e.target.value;
    setWasteType(type);
    setPrice(calculatePrice(weight, type));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time || !weight || !streetNumber || !gateNumber) return;
    const address = `Street ${streetNumber}, Gate ${gateNumber}${apartment ? `, ${apartment}` : ''}${landmark ? ` (Near ${landmark})` : ''}`;
    scheduleNewPickup(date, time, wasteType, parseFloat(weight), parseFloat(price), address);
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
              onChange={handleWasteTypeChange}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option>Household Waste</option>
              <option>Bulky Waste</option>
              <option>Recyclable Waste</option>
              <option>Electronic Waste</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1" htmlFor="weight">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              required
              value={weight}
              onChange={handleWeightChange}
              placeholder="Enter weight in kilograms"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
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
