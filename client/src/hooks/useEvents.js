import { useEffect, useState } from 'react';
import { fetchEvents } from '../services/eventsApi';

export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchEvents()
      .then((data) => {
        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []); 
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
        console.error('fetchEvents error', err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { events, loading, error };
}
