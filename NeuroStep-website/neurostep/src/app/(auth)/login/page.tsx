'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, ArrowRight, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSimpleAuthStore, getDemoCredentials } from '@/store/simpleAuthStore';
import ParticlesBackground from '@/components/particles-background';

// Simple form state interface
interface LoginFormData {
  username: string;
  password: string;
  role: 'athlete' | 'nutritionist';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useSimpleAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    role: 'athlete'
  });

  const demoCredentials = getDemoCredentials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!formData.username || !formData.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Get user role from store and redirect
        const { user } = useSimpleAuthStore.getState();
        const redirectPath = user?.role === 'athlete' ? '/athlete' : '/nutritionist';
        router.push(redirectPath);
      } else {
        setAuthError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setAuthError(null); // Clear error when user starts typing
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Particles Background - Dimmed for login */}
      <ParticlesBackground intensity="medium" className="absolute inset-0 z-0" dimmed={true} />
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                NEUROSTEP
              </h1>
            </div>
            <p className="text-slate-300">Advanced Gait Analysis Platform</p>
          </motion.div>

          {/* Login Form - Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-300">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {authError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm"
                >
                  <p className="text-red-300 text-sm text-center">{authError}</p>
                </motion.div>
              )}
              
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-slate-200 text-sm font-medium block">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300 outline-none"
                    required
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-slate-200 text-sm font-medium block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-slate-400 focus:border-blue-400 focus:bg-white/10 transition-all duration-300 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Role Toggle */}
              <div className="space-y-3">
                <label className="text-slate-200 text-sm font-medium block">Role</label>
                <div className="flex gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('role', 'athlete')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.role === 'athlete'
                        ? 'bg-blue-500/30 border-2 border-blue-400 text-white backdrop-blur-sm shadow-lg'
                        : 'bg-white/5 border border-white/20 text-slate-300 hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Athlete
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('role', 'nutritionist')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      formData.role === 'nutritionist'
                        ? 'bg-purple-500/30 border-2 border-purple-400 text-white backdrop-blur-sm shadow-lg'
                        : 'bg-white/5 border border-white/20 text-slate-300 hover:bg-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Nutritionist
                  </motion.button>
                </div>
              </div>
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm border border-white/10 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
           </motion.div>

           {/* Demo Credentials - Glassmorphism Style */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.6 }}
             className="mt-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
           >
             <div className="text-center mb-4">
               <h3 className="text-lg font-semibold text-white mb-2">Demo Credentials</h3>
               <p className="text-slate-300 text-sm">Quick access to the platform</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl backdrop-blur-sm"
               >
                 <div className="flex items-center gap-2 mb-3">
                   <Activity className="w-4 h-4 text-blue-400" />
                   <span className="text-blue-400 text-sm font-medium">Athlete</span>
                 </div>
                 <div className="space-y-1 text-xs mb-3">
                   <p className="text-slate-300">
                     <span className="text-slate-400">User:</span> {demoCredentials.athlete.username}
                   </p>
                   <p className="text-slate-300">
                     <span className="text-slate-400">Pass:</span> {demoCredentials.athlete.password}
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => {
                     setFormData({
                       username: demoCredentials.athlete.username,
                       password: demoCredentials.athlete.password,
                       role: 'athlete'
                     });
                   }}
                   className="w-full py-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all duration-300 backdrop-blur-sm border border-blue-500/30"
                 >
                   Use Credentials
                 </button>
               </motion.div>
               
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl backdrop-blur-sm"
               >
                 <div className="flex items-center gap-2 mb-3">
                   <Users className="w-4 h-4 text-purple-400" />
                   <span className="text-purple-400 text-sm font-medium">Nutritionist</span>
                 </div>
                 <div className="space-y-1 text-xs mb-3">
                   <p className="text-slate-300">
                     <span className="text-slate-400">User:</span> {demoCredentials.physiotherapist.username}
                   </p>
                   <p className="text-slate-300">
                     <span className="text-slate-400">Pass:</span> {demoCredentials.physiotherapist.password}
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => {
                     setFormData({
                       username: demoCredentials.physiotherapist.username,
                       password: demoCredentials.physiotherapist.password,
                       role: 'nutritionist'
                     });
                   }}
                   className="w-full py-2 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all duration-300 backdrop-blur-sm border border-purple-500/30"
                 >
                   Use Credentials
                 </button>
               </motion.div>
             </div>
           </motion.div>
         </motion.div>
       </div>
     </div>
   );
 }