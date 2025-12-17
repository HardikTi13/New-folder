const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
    },

    getBookings: async (userId?: string) => {
        const query = userId ? `?userId=${userId}` : '';
        const res = await fetch(`${API_URL}/bookings${query}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
    },
    joinWaitlist: async (data: any) => {
        const res = await fetch(`${API_URL}/waitlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to join waitlist');
        return json;
    },

    cancelBooking: async (id: string) => {
        const res = await fetch(`${API_URL}/bookings/${id}`, {
            method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to cancel booking');
        return json;
    },

    // Admin
    createRule: async (data: any) => {
        const res = await fetch(`${API_URL}/admin/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to create rule');
        return json;
    },

    deleteRule: async (id: string) => {
        const res = await fetch(`${API_URL}/admin/rules/${id}`, {
            method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to delete rule');
        return json;
    }
};
