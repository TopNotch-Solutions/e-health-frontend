import { useCallback, useEffect, useState } from 'react';
import { getKitchenDashboard, getKitchenMealPlans } from '../../../api/kitchen';
import { getSocket } from '../../../api/socket';

const POLL_MS = 8000;

export function useKitchenMeals() {
  const [mealData, setMealData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    try {
      const [plans, dashboard] = await Promise.all([
        getKitchenMealPlans(),
        getKitchenDashboard().catch(() => null),
      ]);
      setMealData(plans);
      setStats(dashboard);
    } catch (err) {
      setError(err.message || 'Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onConnect = () => {
      setLive(true);
      refresh();
    };
    const onDisconnect = () => setLive(false);
    const onOrder = () => refresh();

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('kitchen:new_order', onOrder);

    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('kitchen:new_order', onOrder);
    };
  }, [refresh]);

  return { mealData, stats, loading, error, live, refresh };
}
