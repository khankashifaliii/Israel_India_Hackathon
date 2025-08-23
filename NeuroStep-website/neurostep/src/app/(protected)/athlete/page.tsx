'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  Target, 
  RefreshCw,
  Play,
  FileText,
  Users,
  ChevronRight,
  Info
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/Layout/PageHeader';
import { Section } from '@/components/ui/Section';
import { StatCard } from '@/components/Cards/StatCard';
import { Button } from '@/components/ui/button';
import { GlowButton } from '@/components/ui/GlowButton';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { FloatingChat } from '@/components/Chatbot/FloatingChat';
import { useSimpleAuthStore } from '@/store/simpleAuthStore';
import { mockDataService, KPIData, SessionData } from '@/lib/mockData';

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline = ({ data, color }: SparklineProps) => {
  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.map((value, index) => ({ index, value }))}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: number;
  unit: string;
  change: number;
  sparkline: number[];
  definition: string;
  icon: React.ReactNode;
  color: string;
}

const KPICard = ({ title, value, unit, change, sparkline, definition, icon, color }: KPICardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <GlassPanel className="p-4 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300">{title}</h3>
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
          <Sparkline data={sparkline} color={color.includes('cyan') ? '#06b6d4' : color.includes('green') ? '#10b981' : color.includes('purple') ? '#8b5cf6' : '#f59e0b'} />
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold text-white mb-1">
              {value.toFixed(value < 10 ? 2 : 1)}
              <span className="text-sm text-gray-400 ml-1">{unit}</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${
              change >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          </div>
        </div>
        
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg text-xs text-gray-300 z-10"
          >
            {definition}
          </motion.div>
        )}
      </GlassPanel>
    </motion.div>
  );
};

interface SessionItemProps {
  session: SessionData;
}

const SessionItem = ({ session }: SessionItemProps) => {
  const date = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-cyan-400" />
        <div>
          <div className="text-sm font-medium text-white">{date}</div>
          <div className="text-xs text-gray-400">{session.duration} min session</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          session.status === 'Good' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {session.status}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </div>
    </motion.div>
  );
};

export default function AthletePage() {
  const { user } = useSimpleAuthStore();
  const router = useRouter();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const loadData = () => {
    setKpiData(mockDataService.getKPIData());
    setSessionHistory(mockDataService.getSessionHistory());
    setChartData(mockDataService.getMultiLineChartData(timeRange));
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    mockDataService.refreshData();
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    loadData();
    setIsRefreshing(false);
  };
  
  useEffect(() => {
    loadData();
  }, [timeRange]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const athleteName = user?.name || user?.email?.split('@')[0] || 'Athlete';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <PageHeader 
            title={`Welcome, ${athleteName}`}
            description="Weekly Overview"
          />
          <GlowButton
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </GlowButton>
        </div>
        
        {/* KPI Cards */}
        <Section title="Performance Metrics" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData && (
              <>
                <KPICard
                  title="Avg Walking Speed"
                  value={kpiData.walkingSpeed.current}
                  unit={kpiData.walkingSpeed.unit}
                  change={kpiData.walkingSpeed.change}
                  sparkline={kpiData.walkingSpeed.sparkline}
                  definition={kpiData.walkingSpeed.definition}
                  icon={<Zap className="w-4 h-4 text-white" />}
                  color="from-cyan-500 to-blue-600"
                />
                <KPICard
                  title="Cadence"
                  value={kpiData.cadence.current}
                  unit={kpiData.cadence.unit}
                  change={kpiData.cadence.change}
                  sparkline={kpiData.cadence.sparkline}
                  definition={kpiData.cadence.definition}
                  icon={<Activity className="w-4 h-4 text-white" />}
                  color="from-green-500 to-emerald-600"
                />
                <KPICard
                  title="Stride Length"
                  value={kpiData.strideLength.current}
                  unit={kpiData.strideLength.unit}
                  change={kpiData.strideLength.change}
                  sparkline={kpiData.strideLength.sparkline}
                  definition={kpiData.strideLength.definition}
                  icon={<TrendingUp className="w-4 h-4 text-white" />}
                  color="from-purple-500 to-violet-600"
                />
                <KPICard
                  title="Equilibrium Score"
                  value={kpiData.equilibriumScore.current}
                  unit={kpiData.equilibriumScore.unit}
                  change={kpiData.equilibriumScore.change}
                  sparkline={kpiData.equilibriumScore.sparkline}
                  definition={kpiData.equilibriumScore.definition}
                  icon={<Target className="w-4 h-4 text-white" />}
                  color="from-amber-500 to-orange-600"
                />
              </>
            )}
          </div>
        </Section>
        
        {/* Performance Charts Section */}
        <Section title="Performance Analysis" className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trends Chart */}
            <div className="lg:col-span-2">
              <GlassPanel className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Monthly Trends</h3>
                  <div className="flex gap-2">
                    {[7, 30, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setTimeRange(days as 7 | 30 | 90)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          timeRange === days
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cadence" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Cadence"
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="strideFrequency" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="Stride Frequency"
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stepWidth" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        name="Step Width"
                        dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassPanel>
            </div>
            
            {/* Session History */}
            <div>
              <GlassPanel className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
                  <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    View full report
                  </button>
                </div>
                
                <div className="space-y-3">
                  {sessionHistory.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SessionItem session={session} />
                    </motion.div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        </Section>
        
        {/* Quick Actions */}
        <Section title="Quick Actions" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => router.push('/gait-analysis')}
              className="flex items-center justify-center gap-3 p-6 text-left h-auto bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 hover:text-blue-800"
              variant="outline"
            >
              <Play className="w-5 h-5" />
              <div>
                <div className="font-semibold">Open Gait Analysis</div>
                <div className="text-sm opacity-80">Start detailed analysis</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push('/session-analysis')}
              className="flex items-center justify-center gap-3 p-6 text-left h-auto bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 hover:text-green-800"
              variant="outline"
            >
              <Activity className="w-5 h-5" />
              <div>
                <div className="font-semibold">Start Session Analysis</div>
                <div className="text-sm opacity-80">Begin new session</div>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push('/nutrition')}
              className="flex items-center justify-center gap-3 p-6 text-left h-auto bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 hover:text-orange-800"
              variant="outline"
            >
              <Users className="w-5 h-5" />
              <div>
                <div className="font-semibold">Open Nutritionist Plans</div>
                <div className="text-sm opacity-80">View meal plans</div>
              </div>
            </Button>
          </div>
        </Section>
      </div>
      
      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}