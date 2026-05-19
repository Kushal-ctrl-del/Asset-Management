import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { getSessionItem } from '../lib/storage';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const collapsed = getSessionItem<boolean>('abc_sidebar_collapsed') || false;

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      <Sidebar isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />
      
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        "lg:ml-64",
        collapsed && "lg:ml-20"
      )}>
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
