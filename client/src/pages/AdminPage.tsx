import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const [rules, setRules] = useState<any[]>([]);
  const [newRule, setNewRule] = useState({ name: '', type: 'MULTIPLIER', value: 1.5, condition: '' });

  const fetchConfig = () => {
    api.getConfig().then(data => {
        setRules(data.rules);
    }).catch(console.error);
  };

  useEffect(() => {
    // Fetch ALL bookings
    Promise.all([
        api.getBookings().then(setBookings),
        api.getConfig().then(data => setRules(data.rules))
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleAddRule = async () => {
    try {
        await api.createRule({ 
            ...newRule, 
            condition: JSON.parse(newRule.condition || '{}') // Validate JSON
        });
        setNewRule({ name: '', type: 'MULTIPLIER', value: 1.5, condition: '' });
        fetchConfig();
    } catch (err: any) {
        alert('Error: ' + err.message);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if(!confirm('Are you sure?')) return;
    try {
        await api.deleteRule(id);
        fetchConfig();
    } catch (err: any) {
        alert(err.message);
    }
  };

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

      {/* Pricing Rules Management */}
      <h2 className="text-2xl font-bold mt-8">Pricing Rules Configuration</h2>
      <div className="grid gap-6 md:grid-cols-2">
         {/* List Rules */}
         <Card>
            <CardHeader><CardTitle>Existing Rules</CardTitle></CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Action</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {rules.map((rule: any) => (
                        <TableRow key={rule.id}>
                           <TableCell>{rule.name}</TableCell>
                           <TableCell>{rule.type}</TableCell>
                           <TableCell>{rule.value}</TableCell>
                           <TableCell className="text-xs font-mono">{rule.condition}</TableCell>
                           <TableCell>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(rule.id)}>Delete</Button>
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </CardContent>
         </Card>

         {/* Add Rule Form */}
         <Card>
            <CardHeader><CardTitle>Add New Rule</CardTitle></CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div>
                     <label className="text-sm font-medium">Rule Name</label>
                     <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                           placeholder="e.g. Weekend Special" value={newRule.name} onChange={e => setNewRule({...newRule, name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-sm font-medium">Type</label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                           value={newRule.type} onChange={e => setNewRule({...newRule, type: e.target.value})}>
                        <option value="MULTIPLIER">Multiplier (x)</option>
                        <option value="FIXED_ADD">Fixed Add (+)</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-sm font-medium">Value</label>
                     <input type="number" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                           value={newRule.value} onChange={e => setNewRule({...newRule, value: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                     <label className="text-sm font-medium">Condition (JSON)</label>
                     <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                           placeholder='{"days": [0,6], "hours": [18,19]}' value={newRule.condition} onChange={e => setNewRule({...newRule, condition: e.target.value})} />
                     <p className="text-xs text-muted-foreground mt-1">days: 0=Sun, 6=Sat. hours: 0-23.</p>
                  </div>
                  <Button onClick={handleAddRule}>Create Rule</Button>
               </div>
            </CardContent>
         </Card>
      </div> 
    </div>
  );
}
