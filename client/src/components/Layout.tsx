import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  );
}
