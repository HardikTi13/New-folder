import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded user ID for prototype "No Login" requirement
    api.getBookings('demo-user')
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading bookings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Bootings</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No bookings found. Go book a court!</p>
        ) : bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{booking.court.name}</CardTitle>
                <Badge variant={new Date(booking.date) < new Date() ? "secondary" : "default"}>
                  {new Date(booking.date) < new Date() ? "Completed" : "Upcoming"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{booking.startTime}:00 - {booking.endTime}:00</span>
              </div>
              {booking.coach && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coach</span>
                  <span>{booking.coach.name}</span>
                </div>
              )}
               <div className="flex justify-between pt-2 border-t mt-2 font-bold">
                <span>Total Paid</span>
                <span>${booking.totalPrice}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
