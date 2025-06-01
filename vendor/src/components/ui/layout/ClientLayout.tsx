'use client';

import { useEffect, ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from "./sidebar";

interface ClientLayoutProps {
  children: ReactNode;
}

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 md:hidden">
      <button 
        onClick={toggleSidebar}
        className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-primary/10 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <div className="mx-auto font-semibold">Yunike</div>
    </header>
  );
};

export default function ClientLayout({ children }: ClientLayoutProps) {
  // State to track device size for responsive layout
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  useEffect(() => {
    // Handle responsive detection
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar with state passed down */}
      <Sidebar isMobileSidebarOpen={isSidebarOpen} toggleMobileSidebar={toggleSidebar} />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header with menu button */}
        {isMobile && <Header toggleSidebar={toggleSidebar} />}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background yunike-scrollbar-thin">
          <div className="container mx-auto animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 