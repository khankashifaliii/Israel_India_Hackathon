'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    reports: true
  });
  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    marketing: false
  });

  const settingSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      color: 'text-lime-400',
      borderColor: 'border-lime-500/20'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Palette,
      color: 'text-orange-400',
      borderColor: 'border-orange-500/20'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: Database,
      color: 'text-red-400',
      borderColor: 'border-red-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-black mb-2">
            Settings
          </h1>
          <p className="text-blue-800">
            Manage your account preferences and application settings.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-green-200 border-green-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <User className="h-5 w-5 mr-2 text-purple-400" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-blue-800">
                Update your personal information and credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-black">First Name</Label>
                  <Input 
                    id="firstName"
                    defaultValue="Dr. Sarah"
                    className="glass border-purple-500/30 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-black">Last Name</Label>
                  <Input 
                    id="lastName"
                    defaultValue="Johnson"
                    className="glass border-purple-500/30 focus:border-purple-500/50"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  defaultValue="sarah.johnson@neurostep.com"
                  className="glass border-purple-500/30 focus:border-purple-500/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">Role</Label>
                <select className="w-full p-2 rounded-md glass border border-purple-500/30 focus:border-purple-500/50 bg-white text-black">
                  <option value="nutritionist">Nutritionist</option>
                  <option value="athlete">Athlete</option>
                  <option value="physiotherapist">Physiotherapist</option>
                </select>
              </div>
              
              <Separator className="bg-purple-500/20" />
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-black">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="glass border-purple-500/30 focus:border-purple-500/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-black">New Password</Label>
                  <Input 
                    id="newPassword"
                    type="password"
                    className="glass border-purple-500/30 focus:border-purple-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                  <Input 
                    id="confirmPassword"
                    type="password"
                    className="glass border-purple-500/30 focus:border-purple-500/50"
                  />
                </div>
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Notifications */}
          <Card className="bg-green-200 border-green-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center text-lg">
                <Bell className="h-4 w-4 mr-2 text-cyan-400" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications' },
                { key: 'push', label: 'Push Notifications' },
                { key: 'sms', label: 'SMS Alerts' },
                { key: 'reports', label: 'Weekly Reports' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label htmlFor={item.key} className="text-sm text-black">
                    {item.label}
                  </Label>
                  <Switch
                    id={item.key}
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="bg-green-200 border-green-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center text-lg">
                <Shield className="h-4 w-4 mr-2 text-lime-400" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'dataSharing', label: 'Data Sharing' },
                { key: 'analytics', label: 'Usage Analytics' },
                { key: 'marketing', label: 'Marketing Emails' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <Label htmlFor={item.key} className="text-sm text-black">
                    {item.label}
                  </Label>
                  <Switch
                    id={item.key}
                    checked={privacy[item.key as keyof typeof privacy]}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, [item.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-green-200 border-green-300 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center text-lg">
                <Database className="h-4 w-4 mr-2 text-red-400" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full glass border-cyan-500/30 hover:border-cyan-500/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full glass border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </div>
  );
}