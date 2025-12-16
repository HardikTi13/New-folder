const API_URL = 'http://localhost:4000/api';

export const api = {
    getConfig: async () => {
        const res = await fetch(`${API_URL}/config`);
        if (!res.ok) throw new Error('Failed to fetch config');
        return res.json();
    },

    getAvailability: async (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const res = await fetch(`${API_URL}/availability?date=${dateStr}`);
        if (!res.ok) throw new Error('Failed to fetch availability');
        return res.json();
    },

    createBooking: async (data: any) => {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Booking failed');
        return json;
    }
};
