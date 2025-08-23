'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, TrendingUp, Clock, Play, BarChart3, UserCheck, Settings } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Sessions',
      value: '24',
      change: '+12%',
      icon: Activity,
      color: 'text-purple-400'
    },
    {
      title: 'Active Patients',
      value: '8',
      change: '+3',
      icon: Users,
      color: 'text-cyan-400'
    },
    {
      title: 'Improvement Rate',
      value: '87%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-lime-400'
    },
    {
      title: 'Avg Session Time',
      value: '45m',
      change: '-2m',
      icon: Clock,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-3">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here's an overview of your gait analysis activities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className={`text-sm font-medium flex items-center gap-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-orange-600'
                }`}>
                  <span>{stat.change}</span>
                  <span className="text-muted-foreground">from last month</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full" />
              Recent Sessions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your latest gait analysis sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((session, idx) => (
                <div 
                  key={session} 
                  className="flex items-center space-x-4 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                >
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Session #{session + 20}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session === 1 ? '2 hours ago' : session === 2 ? '1 day ago' : '3 days ago'}
                    </p>
                  </div>
                  
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {session === 1 ? 'Completed' : session === 2 ? 'Analyzed' : 'Reviewed'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-foreground text-xl font-semibold flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              Quick Actions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'New Session', icon: Play },
                { label: 'View Reports', icon: BarChart3 },
                { label: 'Patient List', icon: UserCheck },
                { label: 'Settings', icon: Settings }
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="p-4 rounded-lg text-foreground text-sm font-medium transition-all duration-200 border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 hover:shadow-md group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-200" />
                      <span>{action.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}