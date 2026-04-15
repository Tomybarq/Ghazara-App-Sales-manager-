import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-arabic" dir="rtl">
      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="bg-background shadow-md">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div className={`lg:block ${mobileOpen ? 'block' : 'hidden'}`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="lg:mr-64 min-h-screen p-4 lg:p-6 pt-16 lg:pt-6 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}