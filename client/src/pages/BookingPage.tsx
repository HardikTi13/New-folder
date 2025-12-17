import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Court { id: string; name: string; type: string; basePrice: number; }
interface Coach { id: string; name: string; hourlyRate: number; }
interface Equipment { id: string; name: string; price: number; stock: number; }
interface PricingRule { id: string; name: string; type: string; value: number; condition: string; }

export default function BookingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string>('none');
  const [equipmentQty, setEquipmentQty] = useState<{ [key: string]: number }>({});
  
  // Data State
  const [courts, setCourts] = useState<Court[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [equipItems, setEquipItems] = useState<Equipment[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [availability, setAvailability] = useState<{[key: number]: {bookedCourtIds: string[], bookedCoachIds: string[]}}>({});
  const [loading, setLoading] = useState(true);

  // Mock slots (9 AM to 9 PM)
  const slots = Array.from({ length: 13 }, (_, i) => i + 9);

  // Load Config
  useEffect(() => {
    api.getConfig().then(data => {
      setCourts(data.courts);
      setCoaches(data.coaches);
      setEquipItems(data.equipment);
      setRules(data.rules);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  // Load Availability when Date Changes
  useEffect(() => {
    if (date) {
      api.getAvailability(date).then(setAvailability).catch(console.error);
    }
  }, [date]);

  // Price Calculation Logic (Client-side estimation)
  const getTotals = () => {
    let courtPrice = 0;
    let coachPrice = 0;
    let equipmentPrice = 0;

    // 1. Base Court Price
    const court = courts.find(c => c.id === selectedCourt);
    if (court) {
      courtPrice = court.basePrice;
      
      const day = date?.getDay() || 0;
      const hours = selectedSlot || 0;
      const isWeekend = day === 0 || day === 6;

      // Apply Rules locally for display (simplified logic matching server)
      rules.forEach(rule => {
        const cond = JSON.parse(rule.condition);
        let applies = false;
        if (rule.name === 'Weekend' && isWeekend) applies = true;
        if (rule.name === 'Peak Hour' && cond.hours && cond.hours.includes(hours)) applies = true;

        if (applies) {
          if (rule.type === 'MULTIPLIER') courtPrice *= rule.value;
          else if (rule.type === 'FIXED_ADD') courtPrice += rule.value;
        }
      });
    }

    // 2. Coach
    const coach = coaches.find(c => c.id === selectedCoach);
    if (coach) coachPrice = coach.hourlyRate;

    // 3. Equipment
    Object.entries(equipmentQty).forEach(([id, qty]) => {
      const item = equipItems.find(e => e.id === id);
      if (item) equipmentPrice += item.price * qty;
    });

    return { courtPrice, coachPrice, equipmentPrice, total: courtPrice + coachPrice + equipmentPrice };
  };

  const { courtPrice, coachPrice, equipmentPrice, total } = getTotals();

  const handleBooking = async () => {
    if (!selectedCourt || !selectedSlot || !date) return;
    try {
      await api.createBooking({
        userId: 'demo-user',
        courtId: selectedCourt,
        date: date,
        slot: selectedSlot,
        coachId: selectedCoach,
        equipment: equipmentQty
      });
      alert('Booking Successful!');
      // Refresh availability
      api.getAvailability(date).then(setAvailability);
      setSelectedSlot(null);
      setSelectedCourt(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleWaitlist = async () => {
     if (!selectedCourt || !selectedSlot || !date) return;
     try {
       await api.joinWaitlist({
         userId: 'demo-user',
         courtId: selectedCourt,
         date: date,
         slot: selectedSlot
       });
       alert('Added to Waitlist!');
       setSelectedSlot(null);
       setSelectedCourt(null);
     } catch (err: any) {
        alert(err.message);
     }
  };

  const isSelectedCourtBooked = selectedSlot && selectedCourt && availability[selectedSlot]?.bookedCourtIds.includes(selectedCourt);


  if(!date) return <div>Select Date</div>;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <div className="grid grid-cols-4 gap-2 w-full">
              {slots.map(slot => {

                 // Check if ANY court is free? No, check if SPECIFIC court is free is later.
                 // Here we show generic availability? Or just let them pick slot and filter courts?
                 // Let's assume slots are clickable always, courts disable if booked.
                 return (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    onClick={() => { setSelectedSlot(slot); setSelectedCourt(null); }}
                    className={cn("h-10", selectedSlot === slot && "ring-2 ring-primary")}
                  >
                    {slot}:00
                  </Button>
                 );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Court Selection */}
        <Card>
          <CardHeader>
            <CardTitle>2. Select Court</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? <p>Loading courts...</p> : courts.map(court => {
              const isBooked = selectedSlot && availability[selectedSlot]?.bookedCourtIds.includes(court.id);
              return (
                <button
                  key={court.id}
                  disabled={!selectedSlot}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-all hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
                    selectedCourt === court.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                  )}
                  onClick={() => setSelectedCourt(court.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{court.name}</h3>
                    <Badge variant={court.type === 'INDOOR' ? 'secondary' : 'outline'}>
                      {court.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">${court.basePrice}/hr</p>
                  {isBooked && <span className="text-xs text-red-500 font-medium">Booked</span>}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle>3. Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Coach</label>
                <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                  <SelectTrigger disabled={!selectedSlot}>
                    <SelectValue placeholder="Select Coach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Coach</SelectItem>
                    {coaches.map(c => {
                       const isBooked = selectedSlot && availability[selectedSlot]?.bookedCoachIds.includes(c.id);
                       return (
                        <SelectItem key={c.id} value={c.id} disabled={!!isBooked}>
                          {c.name} (+${c.hourlyRate}/hr) {isBooked ? '(Busy)' : ''}
                        </SelectItem>
                       );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {equipItems.map(item => (
                <div key={item.id}>
                  <label className="text-sm font-medium mb-1 block">{item.name} (${item.price})</label>
                  <Select 
                    value={equipmentQty[item.id]?.toString() || "0"} 
                    onValueChange={(val) => setEquipmentQty(prev => ({ ...prev, [item.id]: parseInt(val) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Sidebar */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* ... (Same summary UI as before) ... */}
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedSlot ? `${selectedSlot}:00` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium">{courts.find(c => c.id === selectedCourt)?.name || '-'}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
               <div className="flex justify-between text-sm">
                <span>Court Fee</span>
                <span>${courtPrice.toFixed(2)}</span>
              </div>
              {coachPrice > 0 && <div className="flex justify-between text-sm"><span>Coach</span><span>${coachPrice}</span></div>}
              {equipmentPrice > 0 && <div className="flex justify-between text-sm"><span>Equipment</span><span>${equipmentPrice}</span></div>}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className={cn("w-full", isSelectedCourtBooked ? "bg-orange-500 hover:bg-orange-600" : "")} 
              size="lg" 
              disabled={!selectedSlot || !selectedCourt} 
              onClick={isSelectedCourtBooked ? handleWaitlist : handleBooking}
            >
              {isSelectedCourtBooked ? "Join Waitlist" : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
