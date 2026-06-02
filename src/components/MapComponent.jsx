import { useEffect, useState } from 'react';
import { useMobile } from '../context/MobileContext';

const MapComponent = () => {
  const { user } = useMobile();
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});

  const API_BASE = 'https://eco-friend-api.vercel.app';

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        setMapLoaded(true);
        initializeMap();
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!window.L) return;
    const newMap = window.L.map('mapContainer').setView([0, 0], 2);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(newMap);
    setMap(newMap);
    fetchSchedules(newMap);
  };

  const fetchSchedules = async (mapInstance) => {
    try {
      const token = localStorage.getItem('eco_token');
      const res = await fetch(`${API_BASE}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSchedules(data.schedules || []);
      addMarkersToMap(data.schedules || [], mapInstance);
    } catch (err) {
      console.error('Fetch schedules error:', err);
    }
  };

  const addMarkersToMap = (scheduleList, mapInstance) => {
    if (!mapInstance || !window.L) return;

    // Clear existing markers
    Object.values(markers).forEach(marker => marker.remove());
    const newMarkers = {};

    // Add markers for each schedule with valid address
    scheduleList.forEach((schedule) => {
      if (schedule.address) {
        // Geocode the address (using a simple simulation for now)
        const marker = window.L.marker([0, 0]).addTo(mapInstance);
        marker.bindPopup(`
          <div style="font-size: 12px;">
            <strong>${schedule.user_name}</strong><br/>
            ${schedule.user_email}<br/>
            ${schedule.user_phone || 'N/A'}<br/>
            <strong>Address:</strong> ${schedule.address}<br/>
            <strong>Weight:</strong> ${schedule.weight} kg<br/>
            <strong>Price:</strong> $${schedule.price || 0}<br/>
            <strong>Status:</strong> ${schedule.status}
          </div>
        `);
        newMarkers[schedule.id] = marker;
      }
    });

    setMarkers(newMarkers);
  };

  return (
    <div style={styles.container}>
      <div style={styles.mapSection}>
        <div id="mapContainer" style={styles.map} />
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
              onClick={() => setSelectedSchedule(sched)}
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
