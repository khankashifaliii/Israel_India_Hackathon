'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Apple, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSimpleAuthStore } from '@/store/simpleAuthStore';

const getNavigationItems = (userType: string) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'text-slate-600',
      roles: ['athlete', 'physiotherapist', 'nutritionist']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      color: 'text-slate-500',
      roles: ['athlete', 'physiotherapist', 'nutritionist']
    }
  ];

  const roleSpecificItems = {
    athlete: [
      {
        name: 'Gait Analysis',
        href: '/gait',
        icon: Activity,
        color: 'text-blue-600',
        roles: ['athlete']
      },
      {
        name: 'Session Analysis',
        href: '/session',
        icon: FileText,
        color: 'text-green-600',
        roles: ['athlete']
      },
      {
        name: 'Nutrition',
        href: '/nutrition',
        icon: Apple,
        color: 'text-orange-600',
        roles: ['athlete']
      }
    ],
    physiotherapist: [
      {
        name: 'Gait Analysis',
        href: '/gait',
        icon: Activity,
        color: 'text-blue-600',
        roles: ['physiotherapist']
      },
      {
        name: 'Session Analysis',
        href: '/session',
        icon: FileText,
        color: 'text-green-600',
        roles: ['physiotherapist']
      }
    ],
    nutritionist: [
      {
        name: 'Nutritionist Portal',
        href: '/nutritionist',
        icon: Apple,
        color: 'text-orange-600',
        roles: ['nutritionist']
      }
    ]
  };

  return [
    ...baseItems,
    ...(roleSpecificItems[userType as keyof typeof roleSpecificItems] || [])
  ];
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useSimpleAuthStore();
  const navigationItems = getNavigationItems(user?.role || 'athlete');

  const handleSignOut = async () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="w-64 h-full bg-sidebar border-r border-sidebar-border shadow-lg">
      <div className="h-full flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground font-heading">
                NeuroStep
              </h2>
              <p className="text-xs text-muted-foreground">
                Gait Analysis Platform
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200 cursor-pointer group
                    ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <Separator className="mb-4 bg-sidebar-border" />
          
          <div className="space-y-3">
            {/* User profile */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent border border-sidebar-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || 'Patient'}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-3" />
                <span className="text-sm">Settings</span>
              </Button>
              
              <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleSignOut}
                 className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
               >
                <LogOut className="h-4 w-4 mr-3" />
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}