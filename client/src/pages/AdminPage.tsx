import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AdminPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch ALL bookings (no userId param)
    api.getBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalBookings = bookings.length;

  if (loading) return <div className="p-8">Loading admin data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-xs text-muted-foreground">{booking.id.slice(0, 8)}...</TableCell>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.startTime}:00 - {booking.endTime}:00</TableCell>
                <TableCell>{booking.court.name}</TableCell>
                <TableCell>{booking.userId}</TableCell>
                <TableCell className="text-right">${booking.totalPrice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
