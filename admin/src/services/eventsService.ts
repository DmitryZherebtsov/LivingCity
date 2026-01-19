import axios from 'axios';

// Тип для однієї події (адаптовано з твого JSON)
export interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  url: string;
  organizer: string;
  address: string;
  lon: string;
  lat: string;
  start_time: string;
  end_time: string;
  capacity: number | null;
  is_free: boolean;
  metadata: Record<string, unknown>; // Для { genre: "jazz" } тощо
  created_at: string;
  updated_at: string;
  visitor_count: number;
}

// Інтерфейс для статистик
export interface Stats {
  totalEvents: string;
  activeLocations: string;
  totalAttendees: string;
  growthRate: string;
}

// Функція для fetching подій
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const response = await axios.get<Event[]>('http://localhost:3000/api/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Функція для обчислення статистик
export const calculateStats = (events: Event[]): Stats => {
  if (!events || events.length === 0) {
    return {
      totalEvents: '0',
      activeLocations: '0',
      totalAttendees: '0K',
      growthRate: '0%',
    };
  }

  const totalEvents = events.length;

  const uniqueLocations = new Set(events.map(event => event.address || `${event.lat},${event.lon}`));
  const activeLocations = uniqueLocations.size;

  const totalAttendees = events.reduce((sum, event) => sum + (event.visitor_count || 0), 0);

  const now = new Date();
  const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
  const recentEvents = events.filter(event => new Date(event.created_at) > lastMonth);
  const growthRate = ((recentEvents.length / totalEvents) * 100).toFixed(1) + '%';

  return {
    totalEvents: totalEvents.toLocaleString(),
    activeLocations: activeLocations.toLocaleString(),
    totalAttendees: (totalAttendees / 1000).toFixed(1) + 'K',
    growthRate,
  };
};