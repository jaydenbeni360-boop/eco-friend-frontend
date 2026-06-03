import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMobile } from '../context/MobileContext';
import { MapPin, Truck, Award, Clock, ArrowRight } from 'lucide-react';

// Prefer Vite-provided env vars. Support both names in case Render uses a different key name.
// Do not embed a fallback key in source code to avoid leaking API keys in builds.
const FALLBACK_GOOGLE_KEY = '';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API || FALLBACK_GOOGLE_KEY;

let googleMapsLoadingPromise = null;

const loadGoogleMaps = () => {
  if (googleMapsLoadingPromise) {
    return googleMapsLoadingPromise;
  }

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Check if script tag is already in DOM to be safe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // if already loaded, resolve immediately
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
        return;
      }
      // otherwise wait for its load
      existingScript.addEventListener('load', () => resolve(window.google.maps));
      existingScript.addEventListener('error', (e) => { googleMapsLoadingPromise = null; reject(e); });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    try { script.setAttribute('loading', 'lazy'); } catch (e) {}
    script.onload = () => resolve(window.google.maps);
    script.onerror = (err) => { googleMapsLoadingPromise = null; reject(err); };
    document.head.appendChild(script);
  });

  return googleMapsLoadingPromise;
};

const userCoords = { lat: -1.9456, lng: 30.0891 };

const MobileDashboard = () => {
  const { points, truckDistance, isTruckNear, scheduledSlots, user } = useMobile();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const truckMarkerRef = useRef(null);

  // Compute truck coordinates based on distance (simple linear interpolation)
  const computeTruckCoords = (distance) => {
    const factor = distance / 1.8; // distance ranges from 1.8km (far) to 0.2km (near)
    return {
      lat: -1.9456 + factor * 0.005,
      lng: 30.0891 + factor * 0.007,
    };
  };

  // Initialize Google Map once
  useEffect(() => {
    let isMounted = true;
    loadGoogleMaps()
      .then((maps) => {
        if (!isMounted) return;
        const map = new maps.Map(mapContainerRef.current, {
          center: userCoords,
          zoom: 15,
          disableDefaultUI: true,
          clickableIcons: false,
        });
        mapRef.current = map;
        // Helper to create AdvancedMarkerElement when available, fallback to classic Marker
        const createMarkerElement = (position, { title = '', color = null, icon = null } = {}) => {
          if (maps.marker && maps.marker.AdvancedMarkerElement) {
            const content = document.createElement('div');
            content.style.width = '18px';
            content.style.height = '18px';
            content.style.background = color || '#0ea5a4';
            content.style.borderRadius = '50%';
            content.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
            content.title = title || '';
            return new maps.marker.AdvancedMarkerElement({ position, map, title, content });
          }
          // fallback to classic Marker
          return new maps.Marker({ position, map, title, icon });
        };

        // User marker (green circle)
        const userMarker = createMarkerElement(userCoords, {
          title: 'You',
          color: '#10b981',
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
            scale: 6,
          },
        });
        userMarkerRef.current = userMarker;

        // Truck marker (custom SVG icon)
        const initialTruckCoords = computeTruckCoords(1.8);
        const truckSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'>
                <path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'/>
                <polyline points='14 18 14 14 20 14 22 17 22 18 14 18'/>
                <circle cx='7.5' cy='18.5' r='2.5'/>
                <circle cx='18.5' cy='18.5' r='2.5'/>
              </svg>
            `);
        const truckMarker = createMarkerElement(initialTruckCoords, {
          title: 'Truck',
          icon: {
            url: truckSvg,
            scaledSize: new maps.Size(30, 30),
            anchor: new maps.Point(15, 15),
          },
        });
        truckMarkerRef.current = truckMarker;

        // Fit bounds to include both markers
        const bounds = new maps.LatLngBounds();
        bounds.extend(userCoords);
        bounds.extend(initialTruckCoords);
        map.fitBounds(bounds, { padding: [30, 30] });
      })
      .catch((err) => console.error('Google Maps load error:', err));
    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  // Update truck marker and map bounds when distance changes
  useEffect(() => {
    if (!mapRef.current) return;
    const newPos = computeTruckCoords(truckDistance);
    if (truckMarkerRef.current) {
      truckMarkerRef.current.setPosition(newPos);
    }
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userCoords);
    bounds.extend(newPos);
    mapRef.current.fitBounds(bounds, { padding: [30, 30], animate: true, duration: 1000 });
  }, [truckDistance]);

  return (
    <div className="space-y-6 px-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-500 bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white border border-slate-200/60 shadow-sm rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
            <img src="/copilot_ 20260525_085633.png" alt="Eco Friend Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Welcome back, {user?.name || 'Eco Friend'}!
              </span>
            </div>
            <h1 className="text-xl font-black mt-0.5 tracking-tight text-slate-800">
              Eco <span className="text-emerald-500">Friend</span>
            </h1>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center relative">
          <MapPin className="w-5 h-5 text-emerald-500" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
      </header>

      {/* Guide for New Users */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-2xl">
        <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">New User Guide</span>
        <h3 className="font-bold text-sm text-slate-800 mt-2">How do I schedule a pickup?</h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Open the side drawer menu by clicking the icon in the top left, select <strong>"Schedule Pickup"</strong>, choose your date, and enter your address!
        </p>
        <Link to="/schedule" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline mt-3">
          <span>Go to Schedule Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Points Card */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Collection Score</p>
            <h2 className="text-3xl font-black text-slate-800 mt-1 flex items-baseline gap-1">
              {points} <span className="text-xs font-semibold text-slate-400">points</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">Points earned from clean garbage disposals.</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Real Live Map Tracker */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            Active Collection Trucks
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </h3>
          <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Live GPS Map</span>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative">
          {/* Google Maps container */}
          <div ref={mapContainerRef} className="w-full h-48 rounded-t-2xl" />
          <div className="p-4 bg-slate-900 text-white rounded-b-2xl flex justify-between items-center relative z-20">
            <div>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Distance to house</p>
              <h4 className="text-xl font-black mt-0.5 tracking-tight">{truckDistance.toFixed(2)} km</h4>
            </div>
            <div className="text-right">
              {isTruckNear ? (
                <span className="inline-flex items-center bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                  Truck is Near!
                </span>
              ) : (
                <span className="inline-flex items-center bg-slate-800 text-slate-400 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  En Route
                </span>
              )}
              <p className="text-[9px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                ETA: {Math.max(2, Math.round(truckDistance * 6))} mins
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduled slots list */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Scheduled Waste Pickups</h3>
        <div className="space-y-2">
          {scheduledSlots.map((slot, index) => (
            <div key={index} className="bg-white border border-slate-200/60 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-800">{slot.type}</h5>
                  <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                    {slot.date} • {slot.time}
                  </p>
                </div>
              </div>
              <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase">
                {slot.status}
              </span>
            </div>
          ))}
          {scheduledSlots.length === 0 && (
            <div className="text-center py-6 bg-white border border-slate-200/60 rounded-xl">
              <Truck className="w-6 h-6 text-slate-350 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No waste pickup scheduled yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MobileDashboard;
