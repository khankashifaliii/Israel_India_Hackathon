'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Package, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Download,
  Clock,
  HardDrive,
  Wifi
} from 'lucide-react';
import { useResourcePerformance, useWebVitals, useNetworkPerformance } from '@/hooks/use-performance';
import { cn } from '@/lib/utils';

// Bundle analysis interfaces
interface BundleChunk {
  name: string;
  size: number;
  gzipSize: number;
  modules: string[];
  type: 'main' | 'vendor' | 'chunk' | 'css';
}

interface OptimizationSuggestion {
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

// Mock bundle data (in real app, this would come from webpack-bundle-analyzer)
const mockBundleData: BundleChunk[] = [
  {
    name: 'main',
    size: 245000,
    gzipSize: 89000,
    modules: ['src/app/page.tsx', 'src/components/ui/*'],
    type: 'main'
  },
  {
    name: 'vendor',
    size: 890000,
    gzipSize: 312000,
    modules: ['react', 'react-dom', 'next', 'framer-motion'],
    type: 'vendor'
  },
  {
    name: 'charts',
    size: 156000,
    gzipSize: 45000,
    modules: ['recharts', 'chart.js'],
    type: 'chunk'
  },
  {
    name: 'particles',
    size: 78000,
    gzipSize: 23000,
    modules: ['tsparticles', 'tsparticles-slim'],
    type: 'chunk'
  },
  {
    name: 'styles',
    size: 34000,
    gzipSize: 8000,
    modules: ['globals.css', 'tailwind'],
    type: 'css'
  }
];

const COLORS = ['#7c3aed', '#22d3ee', '#a3e635', '#f59e0b', '#ef4444'];

export function BundleAnalyzer() {
  const [bundleData, setBundleData] = useState<BundleChunk[]>(mockBundleData);
  const [selectedChunk, setSelectedChunk] = useState<BundleChunk | null>(null);
  const { stats, slowResources } = useResourcePerformance();
  const { metrics, score } = useWebVitals();
  const networkInfo = useNetworkPerformance();

  // Calculate bundle statistics
  const bundleStats = useMemo(() => {
    const totalSize = bundleData.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = bundleData.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    const compressionRatio = ((totalSize - totalGzipSize) / totalSize) * 100;
    
    return {
      totalSize: Math.round(totalSize / 1024), // KB
      totalGzipSize: Math.round(totalGzipSize / 1024), // KB
      compressionRatio: Math.round(compressionRatio),
      chunkCount: bundleData.length,
      largestChunk: bundleData.reduce((max, chunk) => 
        chunk.size > max.size ? chunk : max, bundleData[0]
      )
    };
  }, [bundleData]);

  // Generate optimization suggestions
  const optimizationSuggestions = useMemo((): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    // Large bundle size
    if (bundleStats.totalGzipSize > 500) {
      suggestions.push({
        type: 'error',
        title: 'Bundle size is too large',
        description: `Total gzipped size is ${bundleStats.totalGzipSize}KB. Consider code splitting and tree shaking.`,
        impact: 'high',
        effort: 'medium'
      });
    }

    // Large vendor chunk
    const vendorChunk = bundleData.find(chunk => chunk.type === 'vendor');
    if (vendorChunk && vendorChunk.gzipSize > 200000) {
      suggestions.push({
        type: 'warning',
        title: 'Vendor chunk is large',
        description: 'Consider splitting vendor libraries or using dynamic imports for non-critical dependencies.',
        impact: 'medium',
        effort: 'medium'
      });
    }

    // Poor compression ratio
    if (bundleStats.compressionRatio < 60) {
      suggestions.push({
        type: 'warning',
        title: 'Poor compression ratio',
        description: 'Enable better compression algorithms like Brotli or optimize asset types.',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Too many chunks
    if (bundleStats.chunkCount > 10) {
      suggestions.push({
        type: 'info',
        title: 'Many small chunks detected',
        description: 'Consider consolidating smaller chunks to reduce HTTP requests.',
        impact: 'low',
        effort: 'low'
      });
    }

    // Slow resources
    if (slowResources.length > 0) {
      suggestions.push({
        type: 'error',
        title: `${slowResources.length} slow resources detected`,
        description: 'Some resources are taking >1s to load. Consider optimization or lazy loading.',
        impact: 'high',
        effort: 'medium'
      });
    }

    return suggestions;
  }, [bundleStats, bundleData, slowResources]);

  // Prepare chart data
  const chartData = bundleData.map(chunk => ({
    name: chunk.name,
    size: Math.round(chunk.size / 1024),
    gzipSize: Math.round(chunk.gzipSize / 1024),
    type: chunk.type
  }));

  const pieData = bundleData.map((chunk, index) => ({
    name: chunk.name,
    value: Math.round(chunk.gzipSize / 1024),
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundleStats.totalGzipSize}KB</div>
            <p className="text-xs text-muted-foreground">
              {bundleStats.compressionRatio}% compressed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{score}/100</div>
            <Progress value={score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chunks</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundleStats.chunkCount}</div>
            <p className="text-xs text-muted-foreground">
              Largest: {bundleStats.largestChunk.name}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {networkInfo?.effectiveType || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {networkInfo?.downlink || 0} Mbps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Optimization Suggestions
            </CardTitle>
            <CardDescription>
              Recommendations to improve your bundle performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimizationSuggestions.map((suggestion, index) => (
              <Alert key={index} className={cn(
                suggestion.type === 'error' && 'border-red-200 bg-red-50',
                suggestion.type === 'warning' && 'border-yellow-200 bg-yellow-50',
                suggestion.type === 'info' && 'border-blue-200 bg-blue-50'
              )}>
                <AlertDescription className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.description}
                    </p>
                    <div className="flex gap-2">
                      <Badge variant={suggestion.impact === 'high' ? 'destructive' : 
                        suggestion.impact === 'medium' ? 'default' : 'secondary'}>
                        {suggestion.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {suggestion.effort} effort
                      </Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Charts and Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chunks">Chunk Analysis</TabsTrigger>
          <TabsTrigger value="resources">Resource Timing</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bundle Size Distribution</CardTitle>
                <CardDescription>Size breakdown by chunk type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}KB`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compression Efficiency</CardTitle>
                <CardDescription>Original vs compressed sizes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="size" fill="#7c3aed" name="Original (KB)" />
                    <Bar dataKey="gzipSize" fill="#22d3ee" name="Gzipped (KB)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chunks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chunk Details</CardTitle>
              <CardDescription>Detailed analysis of each bundle chunk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundleData.map((chunk, index) => (
                  <div 
                    key={chunk.name}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedChunk?.name === chunk.name 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setSelectedChunk(chunk)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{chunk.name}</h3>
                        <Badge variant={chunk.type === 'main' ? 'default' : 'secondary'}>
                          {chunk.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(chunk.gzipSize / 1024)}KB gzipped
                      </div>
                    </div>
                    <Progress 
                      value={(chunk.gzipSize / bundleStats.totalGzipSize) * 100} 
                      className="mb-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {chunk.modules.slice(0, 3).join(', ')}
                      {chunk.modules.length > 3 && ` +${chunk.modules.length - 3} more`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Performance</CardTitle>
              <CardDescription>Loading times and resource statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalResources}</div>
                  <div className="text-sm text-muted-foreground">Total Resources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.averageLoadTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Load Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.slowResourcesCount}</div>
                  <div className="text-sm text-muted-foreground">Slow Resources</div>
                </div>
              </div>
              
              {slowResources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Slow Resources (&gt;1s)</h4>
                  {slowResources.slice(0, 5).map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded gap-2">
                      <span className="text-sm truncate flex-1 min-w-0" title={resource.name}>
                        {resource.name.split('/').pop()}
                      </span>
                      <span className="text-sm font-medium text-red-600 flex-shrink-0">
                        {Math.round(resource.duration)}ms
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>Performance metrics that matter for user experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">LCP</div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    !metrics.lcp ? "bg-gray-100 text-gray-600" :
                    metrics.lcp <= 2500 ? "bg-green-100 text-green-700" :
                    metrics.lcp <= 4000 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {!metrics.lcp ? 'No data' :
                     metrics.lcp <= 2500 ? 'Good' :
                     metrics.lcp <= 4000 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">FID</div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    !metrics.fid ? "bg-gray-100 text-gray-600" :
                    metrics.fid <= 100 ? "bg-green-100 text-green-700" :
                    metrics.fid <= 300 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {!metrics.fid ? 'No data' :
                     metrics.fid <= 100 ? 'Good' :
                     metrics.fid <= 300 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>

                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold mb-1">
                    {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">CLS</div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded",
                    !metrics.cls ? "bg-gray-100 text-gray-600" :
                    metrics.cls <= 0.1 ? "bg-green-100 text-green-700" :
                    metrics.cls <= 0.25 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {!metrics.cls ? 'No data' :
                     metrics.cls <= 0.1 ? 'Good' :
                     metrics.cls <= 0.25 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BundleAnalyzer;