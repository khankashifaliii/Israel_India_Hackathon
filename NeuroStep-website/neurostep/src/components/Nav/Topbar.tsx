'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useSimpleAuthStore } from '@/store/simpleAuthStore';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/gait': 'Gait Analysis',
  '/session': 'Session Analysis',
  '/nutritionist': 'Nutritionist Portal',
  '/settings': 'Settings'
};

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useSimpleAuthStore();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const currentPageName = pageNames[pathname] || 'Dashboard';
  
  const getWelcomeMessage = () => {
    if (!user) return 'Welcome';
    if (user.role === 'athlete') {
      return `Welcome, ${user.name}`;
    } else if (user.role === 'nutritionist' || user.role === 'physiotherapist') {
      return `Welcome back, ${user.name}`;
    }
    return `Welcome, ${user.name}`;
  };

  const handleSignOut = async () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left section - Page title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground font-heading">
            {currentPageName}
          </h1>
          <div className="hidden md:block w-px h-6 bg-border" />
          <p className="hidden md:block text-sm text-muted-foreground">
            {getWelcomeMessage()}
          </p>
        </div>

        {/* Right section - Search, controls, user menu */}
        <div className="flex items-center space-x-3">
          {/* Global Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, sessions..."
              className="w-64 pl-10 bg-input border-border focus:border-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-9 w-9 p-0 border border-border hover:bg-accent hover:text-accent-foreground"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 p-0 border border-border hover:bg-accent hover:text-accent-foreground"
          >
            <Bell className="h-4 w-4" />
            {/* Notification badge */}
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 border border-border hover:bg-accent hover:text-accent-foreground px-3 py-2 h-auto rounded-lg transition-all duration-200 hover:shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.role === 'athlete' ? 'Athlete' : user?.role === 'nutritionist' ? 'Nutritionist' : 'Physiotherapist'}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 border border-border bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-lg rounded-lg p-2"
              sideOffset={8}
            >
              {/* User Info Header */}
              <div className="px-3 py-3 border-b border-border/50 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.role === 'athlete' ? 'Athlete' : user?.role === 'nutritionist' ? 'Nutritionist' : 'Physiotherapist'} • Online</p>
                  </div>
                </div>
              </div>
              
              <DropdownMenuItem className="rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 cursor-pointer">
                <User className="mr-3 h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Profile</span>
                  <p className="text-xs text-muted-foreground">Manage your account</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 cursor-pointer">
                <Settings className="mr-3 h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Settings</span>
                  <p className="text-xs text-muted-foreground">Preferences & privacy</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors duration-150 cursor-pointer">
                <Bell className="mr-3 h-4 w-4" />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Notifications</span>
                    <p className="text-xs text-muted-foreground">Manage alerts</p>
                  </div>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">3</Badge>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-border/50 my-2" />
              
              <DropdownMenuItem 
                className="rounded-md hover:bg-destructive/10 focus:bg-destructive/10 text-destructive focus:text-destructive transition-colors duration-150 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <div className="flex-1">
                  <span className="text-sm font-medium">Sign out</span>
                  <p className="text-xs opacity-80">End your session</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}