import { useEffect, useState, useRef } from 'react';
import { useMobile } from '../context/MobileContext';

// Use environment key if provided, otherwise fallback to the provided key
const FALLBACK_GOOGLE_KEY = 'AIzaSyCAP3Mp_XOeqE0VJmOGSrZ903IH1vvBNfQ';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || FALLBACK_GOOGLE_KEY;
const API_BASE = import.meta.env.VITE_API_BASE || 'https://eco-friend-api.vercel.app';

const MapComponent = () => {
  const { user } = useMobile();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const mapRef = useRef(null);
  const gmMap = useRef(null);
  const liveTrackMarkerRef = useRef(null); // placeholder for future ESP32 live GPS marker
  const markersRef = useRef([]);

  useEffect(() => {
    if (!window.google) {
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      s.async = true;
      s.defer = true;
      s.onload = () => initMap();
      document.head.appendChild(s);
    } else {
      initMap();
    }

    // cleanup
    return () => {
      if (markersRef.current.length && markersRef.current.forEach) {
        markersRef.current.forEach(m => m.setMap(null));
      }
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    gmMap.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: -1.967308, lng: 30.227309 },
      zoom: 17,
    });

    // Add default marker for NuVision High School (Kabuga)
    try {
      const schoolPosition = { lat: -1.967308, lng: 30.227309 };
      new window.google.maps.Marker({
        position: schoolPosition,
        map: gmMap.current,
        title: 'NuVision High School (Kabuga)',
        animation: window.google.maps.Animation.DROP,
      });
      // Ensure map stays centered on the school by default
      gmMap.current.setCenter(schoolPosition);
      gmMap.current.setZoom(17);
    } catch (e) {
      // ignore marker errors
      // console.warn('School marker init failed', e);
    }

    fetchSchedules();
  };

  const geocodeAddress = (address) => new Promise((resolve, reject) => {
    if (!window.google) return resolve(null);
    const geocoder = new window.google.maps.Geocoder();
    // Prefer results in Rwanda using componentRestrictions; also allow fallback
    const req = { address, componentRestrictions: { country: 'RW' } };
    geocoder.geocode(req, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        // fallback: try appending 'Rwanda' to bias results
        geocoder.geocode({ address: `${address}, Rwanda` }, (res2, st2) => {
          if (st2 === 'OK' && res2 && res2[0]) {
            const loc = res2[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        });
      }
    });
  });

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('eco_token');
      const res = await fetch(`${API_BASE}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.schedules || [];
      setSchedules(list);
      placeMarkers(list);
    } catch (err) {
      console.error('Fetch schedules error:', err);
    }
  };

  const placeMarkers = async (list) => {
    if (!window.google || !gmMap.current) return;
    // clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    // Ensure NuVision High School (Kabuga) is included as a default anchor
    const SCHOOL_POS = { lat: -1.967308, lng: 30.227309 };

    for (const sched of list) {
      if (!sched.address) continue;
      // If lat/lng available on schedule, use it; otherwise geocode
      let position = null;
      if (sched.latitude && sched.longitude) {
        position = { lat: Number(sched.latitude), lng: Number(sched.longitude) };
      } else {
        // geocode address
        // throttle minimal delay to avoid quick burst
        /* eslint-disable no-await-in-loop */
        position = await geocodeAddress(sched.address);
        /* eslint-enable no-await-in-loop */
      }

      if (!position) {
        // try a second geocode attempt with a Kigali hint
        position = await geocodeAddress(`${sched.address}, Kigali, Rwanda`);
      }

      if (!position) continue;

      // persist coordinates back to backend if schedule doesn't already have them
      if ((!sched.latitude || !sched.longitude) && position) {
        try {
          await saveCoords(sched.id, position.lat, position.lng);
          console.log(`Saved coords for schedule ${sched.id}:`, position);
        } catch (err) {
          console.warn('Failed to save coords', err);
        }
      }

      const marker = new window.google.maps.Marker({
        position,
        map: gmMap.current,
        title: sched.user_name || sched.user_email || 'Booking',
      });

      const infoHtml = `
        <div style="font-size:13px; line-height:1.25; max-width:260px;">
          <strong>${sched.user_name || '—'}</strong><br/>
          ${sched.user_email || '—'}<br/>
          📱 ${sched.user_phone || '—'}<br/>
          <div style="margin-top:6px;"><strong>Address:</strong> ${sched.address || '—'}</div>
          <div><strong>Weight:</strong> ${sched.weight || '—'} kg</div>
          <div><strong>Price:</strong> $${sched.price || '0.00'}</div>
          <div><strong>Payment:</strong> ${sched.payment_status || 'none'}</div>
          <div style="margin-top:6px;"><em>Schedule ID: ${sched.id}</em></div>
        </div>
      `;

      const infowindow = new window.google.maps.InfoWindow({ content: infoHtml });
      marker.addListener('click', () => {
        infowindow.open({ anchor: marker, map: gmMap.current, shouldFocus: false });
        setSelectedSchedule(sched);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    }

    if (!bounds.isEmpty) {
      // Do not auto-fit bounds on load — keep default view centered on the school.
      // This prevents schedule markers from recentering the map away from NuVision.
      // If desired later, we can enable fitBounds through a user action.
    } else {
      // no schedule markers found — default to school
      gmMap.current.setCenter(SCHOOL_POS);
      gmMap.current.setZoom(17);
    }

    // --- Live GPS helper: create/update vehicle marker when GPS data arrives ---
    const updateVehicleMarker = (lat, lng) => {
      if (!window.google || !gmMap.current) return;
      const pos = { lat: Number(lat), lng: Number(lng) };
      if (!liveTrackMarkerRef.current) {
        liveTrackMarkerRef.current = new window.google.maps.Marker({
          position: pos,
          map: gmMap.current,
          title: 'Vehicle (live)',
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: '#0ea5a4',
            fillOpacity: 1,
            strokeColor: '#064e3b',
            strokeWeight: 1,
          },
        });
      } else {
        liveTrackMarkerRef.current.setPosition(pos);
      }
    };

    // Expose for debug/testing on window
    window.__updateVehicleMarker = updateVehicleMarker;

    // --- Bluetooth receiver (Web Bluetooth) placeholder ---
    // ESP32 should expose a BLE UART-like characteristic that sends newline-delimited JSON
    const connectBluetooth = async () => {
      if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported');
      // Common UART service UUID (Nordic) — change if your ESP32 uses a different UUID
      const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
      const RX_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
      try {
        const device = await navigator.bluetooth.requestDevice({ filters: [], optionalServices: [SERVICE_UUID] });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(SERVICE_UUID);
        const rx = await service.getCharacteristic(RX_CHAR_UUID);
        await rx.startNotifications();
        let buffer = '';
        rx.addEventListener('characteristicvaluechanged', (evt) => {
          const value = new TextDecoder().decode(evt.target.value);
          buffer += value;
          let idx;
          while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            try {
              const obj = JSON.parse(line);
              if (obj.latitude && obj.longitude) updateVehicleMarker(obj.latitude, obj.longitude);
            } catch (e) {
              // ignore non-json lines
            }
          }
        });
      } catch (err) {
        // expose error to console
        // console.error('Bluetooth connect failed', err);
        throw err;
      }
    };

    // Expose connect function for testing
    window.__connectBluetoothGPS = connectBluetooth;

    // --- Firebase listener placeholder ---
    // Expected Firebase Realtime DB structure: /vehicles/{vehicleId}/location -> { latitude: number, longitude: number, timestamp: 123 }
    const startFirebaseListener = (firebaseApp, vehicleId) => {
      // This is a placeholder — ensure firebase is initialized in your app and pass the app instance here.
      // Example usage:
      // import { getDatabase, ref, onValue } from 'firebase/database';
      // const db = getDatabase(firebaseApp);
      // const locRef = ref(db, `vehicles/${vehicleId}/location`);
      // onValue(locRef, (snap) => { const v = snap.val(); if (v) updateVehicleMarker(v.latitude, v.longitude); });
    };

    window.__startFirebaseListener = startFirebaseListener;
  };

  const saveCoords = async (scheduleId, lat, lng) => {
    try {
      const token = localStorage.getItem('eco_token');
      await fetch(`${API_BASE}/api/schedules/${scheduleId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ latitude: lat, longitude: lng })
      });
    } catch (err) {
      console.error('Save coords error:', err);
      throw err;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mapSection}>
        <div id="mapContainer" ref={mapRef} style={styles.map} />
      </div>
      <div style={styles.detailsSection}>
        <h3 style={styles.detailsTitle}>📍 Booking Details</h3>
        <div style={styles.scheduleList}>
          {schedules.map((sched) => (
            <div
              key={sched.id}
              style={{
                ...styles.scheduleItem,
                backgroundColor: selectedSchedule?.id === sched.id ? '#d1fae5' : '#f0fdf4',
              }}
              onClick={() => {
                setSelectedSchedule(sched);
                // open marker info window if available
                const marker = markersRef.current.find(m => m.getTitle() === (sched.user_name || sched.user_email || 'Booking'));
                if (marker) {
                  new window.google.maps.event.trigger(marker, 'click');
                }
              }}
            >
              <div style={styles.scheduleItemName}>{sched.user_name}</div>
              <div style={styles.scheduleItemText}>{sched.user_email}</div>
              <div style={styles.scheduleItemText}>📱 {sched.user_phone || 'N/A'}</div>
              <div style={styles.scheduleItemText}>📌 {sched.address || 'No address'}</div>
              <div style={styles.scheduleItemText}>⚖️ {sched.weight} kg | 💰 ${sched.price || 0}</div>
              <div style={styles.scheduleItemText}>Status: <strong>{sched.status}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '20px',
    height: '500px',
    backgroundColor: '#f0fdf4',
    padding: '20px',
    borderRadius: '12px',
  },
  mapSection: {
    flex: 2,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
    minHeight: '420px',
  },
  detailsSection: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflowY: 'auto',
  },
  detailsTitle: {
    margin: '0 0 15px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  scheduleItem: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  scheduleItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  scheduleItemText: {
    fontSize: '12px',
    color: '#4b5563',
    marginBottom: '2px',
  },
};

export default MapComponent;
