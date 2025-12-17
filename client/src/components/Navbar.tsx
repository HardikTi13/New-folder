import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          SmashCourt
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Book Now</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost">Admin</Button>
          </Link>

        </div>
      </div>
    </nav>
  );
}
