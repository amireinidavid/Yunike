'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAuthStore from '../../../store/useAuthStore';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, 
  Megaphone, Sparkles, Store, Wallet, Bell, Settings, HelpCircle, 
  LogOut, User, CreditCard, UserCog, Menu, ChevronLeft, ChevronRight, X
} from 'lucide-react';

type MenuItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

interface SidebarProps {
  // Props for mobile control from parent layout
  isMobileSidebarOpen?: boolean;
  toggleMobileSidebar?: () => void;
}

const Sidebar = ({ 
  isMobileSidebarOpen,
  toggleMobileSidebar 
}: SidebarProps = {}) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // State for controlling sidebar visibility and expansion
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [mountAnimationComplete, setMountAnimationComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the externally controlled state if provided (for mobile)
  const sidebarOpenState = isMobileSidebarOpen !== undefined ? isMobileSidebarOpen : isSidebarOpen;
  const toggleSidebar = toggleMobileSidebar || (() => setIsSidebarOpen(!isSidebarOpen));
  
  // Handle screen size detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On desktop, default to expanded
      if (window.innerWidth > 1024) {
        setIsExpanded(true);
        setIsSidebarOpen(true);
      } 
      // On tablet, default to mini (collapsed) sidebar
      else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
        setIsExpanded(false);
        setIsSidebarOpen(true);
      } 
      // On mobile, default to closed
      else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set mount animation complete after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setMountAnimationComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle sidebar expanded/collapsed (mainly for tablet)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Track mouse position for menu item hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!sidebarRef.current) return;
    
    const items = sidebarRef.current.querySelectorAll('.menu-item-hover');
    
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      (item as HTMLElement).style.setProperty('--x', `${x}px`);
      (item as HTMLElement).style.setProperty('--y', `${y}px`);
    });
  };

  // Define menu sections and items
  const menuSections: MenuSection[] = [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
      ]
    },
    {
      title: 'Catalog',
      items: [
        { title: 'Products', path: '/dashboard/products', icon: <Package className="h-5 w-5" />, badge: 12 },
        { title: 'Orders', path: '/dashboard/orders', icon: <ShoppingBag className="h-5 w-5" />, badge: 3 },
        { title: 'Customers', path: '/dashboard/customers', icon: <Users className="h-5 w-5" /> }
      ]
    },
    {
      title: 'Insights',
      items: [
        { title: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="h-5 w-5" /> },
        { title: 'Marketing', path: '/dashboard/marketing', icon: <Megaphone className="h-5 w-5" /> },
        { title: 'AI Assistant', path: '/dashboard/ai', icon: <Sparkles className="h-5 w-5" />, badge: 'New' }
      ]
    },
    {
      title: 'Business',
      items: [
        { title: 'Store Settings', path: '/dashboard/store', icon: <Store className="h-5 w-5" /> },
        { title: 'Finance', path: '/dashboard/finance', icon: <Wallet className="h-5 w-5" /> },
        { title: 'Notifications', path: '/dashboard/notifications', icon: <Bell className="h-5 w-5" />, badge: 5 }
      ]
    },
    {
      title: 'Account',
      items: [
        { title: 'Account Settings', path: '/dashboard/account', icon: <Settings className="h-5 w-5" /> },
        { title: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
        { title: 'Stripe Connect', path: '/dashboard/stripe-connect', icon: <CreditCard className="h-5 w-5" /> },
        { title: 'Profile', path: '/dashboard/profile', icon: <UserCog className="h-5 w-5" /> },
        { title: 'Help & Support', path: '/dashboard/help', icon: <HelpCircle className="h-5 w-5" /> }
      ]
    }
  ];

  // Whether menu item is active
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname.startsWith(path) && path !== '/dashboard';
  };

  // Mobile close button for when sidebar is open
  const MobileCloseButton = () => (
    <button
      onClick={toggleSidebar}
      className="md:hidden absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-sidebar-accent/80 rounded-full"
      aria-label="Close sidebar"
    >
      <X size={18} />
    </button>
  );
  
  // Tablet toggle expand/collapse button
  const ExpandButton = () => (
    <button
      onClick={toggleExpanded}
      className={`
        hidden md:flex lg:hidden
        absolute -right-3 top-24
        w-6 h-12 rounded-r-xl
        bg-sidebar-accent text-sidebar-foreground
        items-center justify-center
        shadow-lg
        hover:bg-sidebar-primary hover:text-sidebar-primary-foreground
        transition-all duration-300
        ${isExpanded ? '' : 'animate-pulse-slow'}
        z-30
      `}
      aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
    </button>
  );
  
  // Mobile overlay for when sidebar is open
  const Overlay = () => (
    <div
      className={`
        md:hidden
        fixed inset-0 bg-black/50 backdrop-blur-sm z-20
        transition-opacity duration-300
        ${sidebarOpenState ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      onClick={toggleSidebar}
      aria-hidden="true"
    />
  );

  // Render each menu section with staggered animations
  const renderMenuSections = () => {
    return menuSections.map((section, sectionIndex) => (
      <div 
        key={sectionIndex} 
        className={`
          mb-6
          ${mountAnimationComplete ? 'animate-fade-in' : ''}
        `}
        style={{ 
          animationDelay: `${sectionIndex * 0.05}s`,
          opacity: mountAnimationComplete ? 1 : 0
        }}
      >
        {/* Section title - only show when expanded */}
        {isExpanded && (
          <h3 className="px-3 mb-2 text-xs uppercase font-semibold text-sidebar-foreground/70 tracking-wider">
            {section.title}
          </h3>
        )}
        
        {/* Section items */}
        <ul className="space-y-1">
          {section.items.map((item, itemIndex) => {
            const active = isActive(item.path);
            const delay = (sectionIndex * 5 + itemIndex) * 0.03;
            
            return (
              <li 
                key={itemIndex} 
                className={`
                  ${mountAnimationComplete ? 'animate-scale-in' : ''}
                `}
                style={{ 
                  animationDelay: `${delay}s`,
                  opacity: mountAnimationComplete ? 1 : 0
                }}
              >
                <Link
                  href={item.path}
                  className={`
                    menu-item-hover
                    group flex items-center gap-3
                    ${isExpanded ? 'px-3 py-2' : 'py-3 md:justify-center'}
                    rounded-md transition-all duration-200
                    ${active 
                      ? 'bg-sidebar-accent text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/30'}
                    ${active && !isExpanded ? 'md:border-l-4 md:border-l-primary' : ''}
                    relative
                    hover:shadow-md
                  `}
                  title={!isExpanded ? item.title : undefined}
                >
                  <div className={`
                    ${active ? 'text-sidebar-primary' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'}
                    transition-transform group-hover:scale-110 duration-200
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Label - only show when expanded */}
                  {isExpanded && (
                    <span className="flex-grow transition-all">{item.title}</span>
                  )}
                  
                  {/* Badge - adapt based on sidebar state */}
                  {item.badge && (
                    <span className={`
                      text-xs rounded-full px-2 py-0.5
                      ${!isExpanded ? 'absolute -top-1 -right-1 md:right-1' : ''}
                      ${typeof item.badge === 'string' && item.badge.toLowerCase() === 'new' 
                        ? 'bg-purple-400/20 text-purple-300' 
                        : 'bg-sidebar-primary/20 text-sidebar-primary-foreground/90'}
                      animate-pulse-slow
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ));
  };

  return (
    <>
      {/* Mobile overlay outside of sidebar */}
      <Overlay />
      <ExpandButton />
      
      <aside 
        ref={sidebarRef}
        onMouseMove={handleMouseMove}
        className={`
          h-full bg-sidebar border-r border-sidebar-border
          flex flex-col
          transition-all duration-300 ease-in-out
          shadow-xl shadow-black/10
          ${isMobile 
            ? `${sidebarOpenState ? 'w-[280px]' : 'w-0'} fixed inset-y-0 left-0 z-30` 
            : `${isExpanded ? 'md:w-[280px]' : 'md:w-[70px]'} relative`
          }
          ${isMobile ? (sidebarOpenState ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${mountAnimationComplete ? 'animate-slide-in' : ''}
        `}
      >
        {/* Show close button only on mobile when sidebar is open */}
        {isMobile && sidebarOpenState && <MobileCloseButton />}
        
        {/* Top section with logo - add animation */}
        <div className={`
          px-6 py-6 ${isMobile ? 'pr-12' : ''}
          ${isExpanded ? 'md:px-6' : 'md:px-2'}
          transition-all duration-300
          ${mountAnimationComplete ? 'animate-fade-in' : ''}
        `}
        style={{ animationDelay: '0.1s', opacity: mountAnimationComplete ? 1 : 0 }}
        >
          <div className={`
            flex items-center gap-3
            ${isExpanded ? '' : 'md:justify-center'}
          `}>
            <div className="flex-shrink-0 w-10 h-10 rounded-md bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
              Y
            </div>
            {(isExpanded || isMobile) && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                Yunike
              </span>
            )}
          </div>
        </div>

        {/* User info section - add animation */}
        <div className={`
          px-6 py-3 mb-4
          ${isExpanded ? 'md:px-6' : 'md:px-2'}
          ${mountAnimationComplete ? 'animate-fade-in' : ''}
        `}
        style={{ animationDelay: '0.2s', opacity: mountAnimationComplete ? 1 : 0 }}
        >
          <div className={`
            flex items-center gap-3
            ${isExpanded ? '' : 'md:justify-center'}
          `}>
            <div className="flex-shrink-0 relative">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-sidebar animate-pulse"></div>
            </div>
            
            {(isExpanded || isMobile) && (
              <div className="flex flex-col overflow-hidden">
                <p className="font-semibold text-sidebar-foreground truncate">
                  {user?.vendor?.storeName || user?.name || 'Vendor Store'}
                </p>
                <p className="text-sm text-sidebar-foreground/70 truncate">
                  {user?.email || 'vendor@example.com'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className={`
          px-4 mb-2
          ${isExpanded ? 'md:px-4' : 'md:px-2'}
        `}>
          <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent"></div>
        </div>
        
        {/* Menu sections with custom scrollbar - render with staggered animations */}
        <div className={`
          flex-grow px-3 py-4 overflow-y-auto yunike-scrollbar
          ${isExpanded ? 'md:px-3' : 'md:px-1'}
        `}>
          {renderMenuSections()}
        </div>

        {/* Bottom logout section - add animation */}
        <div className={`
          border-t border-sidebar-border mt-auto
          ${mountAnimationComplete ? 'animate-fade-in' : ''}
        `}
        style={{ animationDelay: '0.4s', opacity: mountAnimationComplete ? 1 : 0 }}
        >
          <button
            onClick={logout}
            className={`
              menu-item-hover
              flex items-center gap-3 w-full
              px-6 py-4 text-left text-red-400
              hover:bg-sidebar-accent/20 transition-all
              ${isExpanded ? '' : 'md:justify-center'}
            `}
            title={!isExpanded ? "Sign Out" : undefined}
          >
            <LogOut className="h-5 w-5" />
            {(isExpanded || isMobile) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
