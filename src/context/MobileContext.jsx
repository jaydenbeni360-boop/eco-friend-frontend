/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const MobileContext = createContext();

export const useMobile = () => useContext(MobileContext);

const API_BASE = import.meta.env.VITE_API_BASE || 'https://eco-friend-api.vercel.app';

export const MobileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [truckDistance, setTruckDistance] = useState(1.8);
  const [isTruckNear, setIsTruckNear] = useState(false);
  
  const [initializing, setInitializing] = useState(true);
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch user data (schedules and pickups/points) from the API database
  const fetchUserData = async (currentUser) => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('eco_token');
      if (!token) return;

      // 1. Fetch Pickups
      const pickupsRes = await fetch(`${API_BASE}/api/pickups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (pickupsRes.ok) {
        const pickups = await pickupsRes.json();
        // Calculate points based on pickups
        const totalPoints = pickups.reduce((sum, p) => sum + p.points, 0);
        setPoints(totalPoints);

        // Format pickups for logs
        const formattedLogs = pickups.map(p => ({
          id: p.id,
          type: p.type,
          weight: p.weight ? `${p.weight}kg` : '2.0kg',
          date: new Date(p.collected_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          points: `+${p.points}`,
          status: 'Collected'
        }));
        setLogs(formattedLogs);
      }

      // 2. Fetch Schedules
      const schedulesRes = await fetch(`${API_BASE}/api/schedules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (schedulesRes.ok) {
        const schedules = await schedulesRes.json();
        const formattedSlots = schedules.map(s => ({
          id: s.id,
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: s.time.substring(0, 5), // 'HH:MM'
          type: `${s.waste_type} Pickup`,
          waste_type: s.waste_type,
          weight: s.weight,
          price: s.price,
          amount_due: s.amount_due,
          payment_status: s.payment_status,
          status: s.status,
          address: s.address,
          latitude: s.latitude,
          longitude: s.longitude,
          house_number: s.house_number
        }));
        setScheduledSlots(formattedSlots);
      }
    } catch (err) {
      console.error('Error fetching user data from API database:', err);
    }
  };

  // Restore session from token on mount
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('eco_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload && payload.exp * 1000 > Date.now()) {
            const sessionUser = { id: payload.id, name: payload.name, email: payload.email, is_admin: !!payload.is_admin };
            setUser(sessionUser);
            await fetchUserData(sessionUser);
          } else {
            localStorage.removeItem('eco_token');
          }
        } catch {
          localStorage.removeItem('eco_token');
        }
      }
      setInitializing(false);
    };
    initSession();
  }, []);

  // Sync data whenever user state changes (e.g. login)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      setPoints(0);
      setLogs([]);
      setScheduledSlots([]);
      return;
    }

    const loadUserData = async () => {
      await fetchUserData(user);
    };

    void loadUserData();
  }, [user]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Simulate truck moving closer
  useEffect(() => {
    const timer = setInterval(() => {
      setTruckDistance((prev) => {
        if (prev <= 0.2) return 0.2;
        const next = Math.max(0.2, Number((prev - 0.15).toFixed(2)));
        if (next <= 0.6 && !isTruckNear) {
          setIsTruckNear(true);
          addNotification({
            id: Date.now(),
            title: 'Collection Truck Arriving Soon!',
            message: 'The waste collection truck is just 600m away. Please put your bins outside.',
            type: 'alert'
          });
        }
        return next;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, [isTruckNear]);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev]);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(notif.title, { body: notif.message, icon: '/favicon.svg' });
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // ─── AUTH ────────────────────────────────────────────────────────────────────
  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Login failed' };
      localStorage.setItem('eco_token', data.token);
      const loggedUser = { id: data.user.id, name: data.user.name, email: data.user.email, is_admin: !!data.user.is_admin };
      setUser(loggedUser);
      return { success: true, is_admin: !!data.user.is_admin };
    } catch {
      return { success: false, message: 'Server unreachable. Please try again.' };
    }
  };

  const registerUser = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Registration failed' };
      localStorage.setItem('eco_token', data.token);
      const registeredUser = { id: data.user.id, name: data.user.name, email: data.user.email, phone: data.user.phone, is_admin: false };
      setUser(registeredUser);
      return { success: true };
    } catch {
      return { success: false, message: 'Server unreachable. Please try again.' };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('eco_token');
    setUser(null);
  };

  // ─── SCHEDULE ────────────────────────────────────────────────────────────────
  const scheduleNewPickup = async (date, time, wasteType, weight = 1.0, price = 0, address = '', latitude = null, longitude = null) => {
    try {
      const token = localStorage.getItem('eco_token');
      const res = await fetch(`${API_BASE}/api/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, time, waste_type: wasteType, weight, price, address, latitude, longitude })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message };

      // Re-fetch data to sync with backend DB
      await fetchUserData(user);

      // Immediately credit points for scheduling (1 point per kg rounded)
      try {
        const earnedPoints = Math.max(1, Math.round(Number(weight) || 1));
        await fetch(`${API_BASE}/api/pickups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ type: wasteType, weight, points: earnedPoints })
        });
        setPoints(prev => prev + earnedPoints);
        addNotification({
          id: Date.now(),
          title: 'Pickup Scheduled!',
          message: `Scheduled ${weight}kg of ${wasteType} for ${date} at ${time}. You earned +${earnedPoints} points!`,
          type: 'success'
        });
      } catch (err) {
        // non-fatal; still notify user
        addNotification({
          id: Date.now(),
          title: 'Pickup Scheduled!',
          message: `Scheduled ${weight}kg of ${wasteType} for ${date} at ${time}.`,
          type: 'success'
        });
      }
      return { success: true };
    } catch {
      // Fallback update in case API is temporarily offline
      const newSlot = { date, time, type: `${wasteType} Pickup`, status: 'Upcoming', weight, price, address, latitude, longitude };
      setScheduledSlots(prev => [newSlot, ...prev]);
      addNotification({
        id: Date.now(),
        title: 'Pickup Scheduled!',
        message: `Scheduled ${weight}kg of ${wasteType} for ${date} at ${time}. Total: $${price}`,
        type: 'success'
      });
      return { success: true };
    }
  };

  // ─── MOMO MOBILE MONEY PAYMENT ────────────────────────────────────────────────
  const payMomo = async (scheduleId, amount, pin, phone) => {
    try {
      const token = localStorage.getItem('eco_token');
      const res = await fetch(`${API_BASE}/api/schedules/${scheduleId}/pay-momo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ amount, pin, phone })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Momo payment failed' };

      // Sync user data to update the status to 'paid' and 'Completed'
      await fetchUserData(user);

      addNotification({
        id: Date.now(),
        title: 'MoMo Payment Successful!',
        message: `Payment of ${amount} processed via MoMo. Status updated to Completed.`,
        type: 'success'
      });
      return { success: true, message: data.message };
    } catch (err) {
      console.error('payMomo error:', err);
      return { success: false, message: 'Server unreachable. Please try again.' };
    }
  };

  // ─── PICKUP LOG ──────────────────────────────────────────────────────────────
  const verifyBinAndReward = async (binId, earnedPoints, wasteType, wasteWeight) => {
    try {
      const token = localStorage.getItem('eco_token');
      await fetch(`${API_BASE}/api/pickups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: wasteType, weight: wasteWeight, points: earnedPoints })
      });
    } catch { /* fallback gracefully */ }

    // Re-fetch to sync point totals and lists with backend DB
    await fetchUserData(user);

    addNotification({
      id: Date.now(),
      title: 'Drop-off Confirmed!',
      message: `Bin ${binId} verified. You earned +${earnedPoints} points!`,
      type: 'success'
    });
  };

  return (
    <MobileContext.Provider value={{
      user, setUser, loginUser, registerUser, logoutUser,
      points, setPoints,
      notifications, addNotification, removeNotification,
      truckDistance, isTruckNear,
      logs, setLogs,
      verifyBinAndReward,
      scheduledSlots, scheduleNewPickup, payMomo,
      initializing
    }}>
      {children}
    </MobileContext.Provider>
  );
};
