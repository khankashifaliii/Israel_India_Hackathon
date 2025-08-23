'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Activity, AlertTriangle, BarChart3, Download, Save, Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GaitSample, FallSample, GaitMetrics, SnapshotRecord } from '@/lib/contracts';

const GaitAnalysisPortal = () => {
  // Pressure Insoles State
  const [pressureEnabled, setPressureEnabled] = useState(false);
  const [pressureData, setPressureData] = useState<Array<{time: string, left: number, right: number}>>([]);
  const [copData, setCopData] = useState<Array<{x: number, y: number}>>([]);
  const [kpis, setKpis] = useState({
    strideLength: 0,
    strideFreq: 0,
    cadence: 0,
    stepWidth: 0
  });

  // Fall Detection State
  const [fallEnabled, setFallEnabled] = useState(false);
  const [fallStatus, setFallStatus] = useState<'Stable' | 'Fall Event Detected'>('Stable');
  const [accelerationData, setAccelerationData] = useState<Array<{time: string, ax: number, ay: number, az: number}>>([]);
  const [isBlinking, setIsBlinking] = useState(false);

  // Analysis State
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<GaitMetrics>({
    gaitCyclePhases: { stance: 60, swing: 40, doubleSupport: 20 },
    posturalSwayIndex: 0.8,
    equilibriumScore: 85,
    walkingSpeedEstimate: 1.2
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Refs for intervals
  const pressureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fallIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const kpiIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pressure Insoles Simulation
  useEffect(() => {
    if (pressureEnabled) {
      pressureIntervalRef.current = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        // Simulate pressure data (0-100)
        const leftPressure = Math.random() * 50 + 25 + Math.sin(Date.now() / 1000) * 20;
        const rightPressure = Math.random() * 50 + 25 + Math.cos(Date.now() / 1000) * 20;
        
        // Simulate Center of Pressure
        const copX = Math.random() * 20 - 10;
        const copY = Math.random() * 30 - 15;

        setPressureData(prev => {
          const newData = [...prev, { time: timeStr, left: leftPressure, right: rightPressure }];
          return newData.slice(-20); // Keep last 20 points
        });

        setCopData(prev => {
          const newData = [...prev, { x: copX, y: copY }];
          return newData.slice(-50); // Keep last 50 points
        });
      }, 200); // 5Hz = 200ms

      // Update KPIs every second
      kpiIntervalRef.current = setInterval(() => {
        setKpis({
          strideLength: Math.random() * 0.5 + 1.2, // 1.2-1.7m
          strideFreq: Math.random() * 0.3 + 0.8, // 0.8-1.1 Hz
          cadence: Math.random() * 20 + 100, // 100-120 steps/min
          stepWidth: Math.random() * 0.1 + 0.1 // 0.1-0.2m
        });
      }, 1000);
    } else {
      if (pressureIntervalRef.current) {
        clearInterval(pressureIntervalRef.current);
        pressureIntervalRef.current = null;
      }
      if (kpiIntervalRef.current) {
        clearInterval(kpiIntervalRef.current);
        kpiIntervalRef.current = null;
      }
      setPressureData([]);
      setCopData([]);
    }

    return () => {
      if (pressureIntervalRef.current) clearInterval(pressureIntervalRef.current);
      if (kpiIntervalRef.current) clearInterval(kpiIntervalRef.current);
    };
  }, [pressureEnabled]);

  // Fall Detection Simulation
  useEffect(() => {
    if (fallEnabled) {
      fallIntervalRef.current = setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        
        // Simulate acceleration data
        const ax = Math.random() * 4 - 2; // -2 to 2 g
        const ay = Math.random() * 4 - 2;
        const az = Math.random() * 2 + 8; // 8-10 g (gravity + movement)
        
        // Rarely trigger fall event (1% chance)
        const fallDetected = Math.random() < 0.01;
        
        if (fallDetected) {
          setFallStatus('Fall Event Detected');
          setIsBlinking(true);
          toast.error('Fall Event Detected!', {
            description: 'Emergency protocols activated'
          });
          
          // Reset after 5 seconds
          setTimeout(() => {
            setFallStatus('Stable');
            setIsBlinking(false);
          }, 5000);
        }

        setAccelerationData(prev => {
          const newData = [...prev, { time: timeStr, ax, ay, az }];
          return newData.slice(-20);
        });
      }, 100); // 10Hz
    } else {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current);
        fallIntervalRef.current = null;
      }
      setAccelerationData([]);
      setFallStatus('Stable');
      setIsBlinking(false);
    }

    return () => {
      if (fallIntervalRef.current) clearInterval(fallIntervalRef.current);
    };
  }, [fallEnabled]);

  const generateSnapshot = () => {
    const snapshot: SnapshotRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration: 60, // 1 minute simulation
      gaitSamples: [], // Would contain actual samples
      fallSamples: [], // Would contain actual samples
      metrics: {
        ...currentMetrics,
        gaitCyclePhases: {
          stance: Math.random() * 10 + 55,
          swing: Math.random() * 10 + 35,
          doubleSupport: Math.random() * 5 + 15
        },
        posturalSwayIndex: Math.random() * 0.5 + 0.5,
        equilibriumScore: Math.random() * 20 + 70,
        walkingSpeedEstimate: Math.random() * 0.8 + 0.8
      }
    };
    
    setCurrentMetrics(snapshot.metrics);
    setIsAnalysisOpen(true);
  };

  const saveSnapshot = () => {
    const snapshot: SnapshotRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      duration: 60,
      gaitSamples: [],
      fallSamples: [],
      metrics: currentMetrics
    };
    
    setSnapshots(prev => [...prev, snapshot]);
    toast.success('Snapshot saved successfully!');
  };

  const exportPDF = async () => {
    // Import jsPDF dynamically
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('NeuroStep - Gait Analysis Report', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    
    // Metrics
    doc.setFontSize(16);
    doc.text('Gait Metrics', 20, 65);
    
    doc.setFontSize(12);
    doc.text(`Stance Phase: ${currentMetrics.gaitCyclePhases.stance.toFixed(1)}%`, 20, 80);
    doc.text(`Swing Phase: ${currentMetrics.gaitCyclePhases.swing.toFixed(1)}%`, 20, 95);
    doc.text(`Double Support: ${currentMetrics.gaitCyclePhases.doubleSupport.toFixed(1)}%`, 20, 110);
    doc.text(`Postural Sway Index: ${currentMetrics.posturalSwayIndex.toFixed(2)}`, 20, 125);
    doc.text(`Equilibrium Score: ${currentMetrics.equilibriumScore.toFixed(1)}`, 20, 140);
    doc.text(`Walking Speed: ${currentMetrics.walkingSpeedEstimate.toFixed(2)} m/s`, 20, 155);
    
    // Footer
    doc.setFontSize(10);
    doc.text('NeuroStep - Advanced Gait Analysis Platform', 20, 280);
    
    doc.save('gait-analysis-report.pdf');
    toast.success('PDF exported successfully!');
  };

  // File Upload Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'text/plain', 'application/csv'];
      const validExtensions = ['.csv', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        setAnalysisResults(null);
        setShowResults(false);
        toast.success(`File selected: ${file.name}`);
      } else {
        toast.error('Please select a CSV or TXT file');
        event.target.value = '';
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/analyze-gait', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResults(data.results);
        setShowResults(true);
        toast.success('File analysis completed successfully!');
      } else {
        toast.error(data.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload and analyze file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setAnalysisResults(null);
    setShowResults(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Gait Analysis Portal</h1>
          <p className="text-slate-600">Real-time monitoring and analysis of gait patterns and fall detection</p>
        </div>

        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <CardTitle>File Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select File
                </label>
                
                {selectedFile && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedFile.name}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFile}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || isUploading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analyze File
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-gray-600">
                Upload CSV or TXT files containing IMU sensor data for gait analysis using the LT-StrideNet model.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results Section */}
        {showResults && analysisResults && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Average Stride Length</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisResults.average_stride_length?.toFixed(2) || 'N/A'} m
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Stride Count</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {analysisResults.stride_count || 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Walking Speed</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisResults.walking_speed_estimate?.toFixed(2) || 'N/A'} m/s
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Cadence</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {analysisResults.cadence?.toFixed(1) || 'N/A'} steps/min
                  </p>
                </div>
              </div>
              
              {analysisResults.analysis_summary && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Analysis Summary</h3>
                  <p className="text-gray-800">{analysisResults.analysis_summary}</p>
                </div>
              )}
              
              {analysisResults.stride_lengths && analysisResults.stride_lengths.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Individual Stride Lengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.stride_lengths.slice(0, 10).map((length: number, index: number) => (
                      <Badge key={index} variant="outline" className="text-black">
                        {length.toFixed(2)}m
                      </Badge>
                    ))}
                    {analysisResults.stride_lengths.length > 10 && (
                      <Badge variant="secondary" className="text-black">
                        +{analysisResults.stride_lengths.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tracker Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pressure Insoles Card */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle>Pressure Insoles</CardTitle>
              </div>
              <Switch
                checked={pressureEnabled}
                onCheckedChange={setPressureEnabled}
              />
            </CardHeader>
            <CardContent>
              {pressureEnabled ? (
                <div className="space-y-4">
                  {/* Pressure Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pressureData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="left" stroke="#3b82f6" name="Left Foot" strokeWidth={2} />
                        <Line type="monotone" dataKey="right" stroke="#ef4444" name="Right Foot" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* CoP Mini Plot */}
                  <div className="h-32">
                    <h4 className="text-sm font-medium mb-2">Center of Pressure Path</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={copData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="x" domain={[-15, 15]} />
                        <YAxis dataKey="y" domain={[-20, 20]} />
                        <Tooltip />
                        <Scatter dataKey="y" fill="#8b5cf6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* KPIs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{kpis.strideLength.toFixed(2)}m</div>
                      <div className="text-xs text-slate-600">Stride Length</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{kpis.strideFreq.toFixed(2)}Hz</div>
                      <div className="text-xs text-slate-600">Stride Frequency</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{kpis.cadence.toFixed(0)}</div>
                      <div className="text-xs text-slate-600">Cadence (steps/min)</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{kpis.stepWidth.toFixed(2)}m</div>
                      <div className="text-xs text-slate-600">Step Width</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Enable pressure tracking to view real-time data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fall Detection Card */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle>Fall Detection</CardTitle>
              </div>
              <Switch
                checked={fallEnabled}
                onCheckedChange={setFallEnabled}
              />
            </CardHeader>
            <CardContent>
              {fallEnabled ? (
                <div className="space-y-4">
                  {/* Status Pill */}
                  <div className="flex justify-center mb-4">
                    <Badge 
                      variant={fallStatus === 'Stable' ? 'default' : 'destructive'}
                      className={`px-4 py-2 text-lg ${isBlinking ? 'animate-pulse border-2 border-red-500' : ''}`}
                    >
                      {fallStatus}
                    </Badge>
                  </div>
                  
                  {/* Acceleration Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={accelerationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="ax" stroke="#ef4444" name="X-axis" strokeWidth={1} />
                        <Line type="monotone" dataKey="ay" stroke="#22c55e" name="Y-axis" strokeWidth={1} />
                        <Line type="monotone" dataKey="az" stroke="#3b82f6" name="Z-axis" strokeWidth={1} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Enable fall detection to monitor stability</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Button */}
        <div className="flex justify-center">
          <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
            <SheetTrigger asChild>
              <Button onClick={generateSnapshot} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <BarChart3 className="mr-2 h-5 w-5" />
                Generate Snapshot
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Gait Analysis Snapshot</SheetTitle>
                <SheetDescription>
                  Comprehensive analysis of current gait patterns and metrics
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Gait Cycle Phases */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Gait Cycle Phases</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Stance Phase:</span>
                      <span className="font-medium">{currentMetrics.gaitCyclePhases.stance.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Swing Phase:</span>
                      <span className="font-medium">{currentMetrics.gaitCyclePhases.swing.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Double Support:</span>
                      <span className="font-medium">{currentMetrics.gaitCyclePhases.doubleSupport.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Other Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Stability Metrics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Postural Sway Index:</span>
                      <span className="font-medium">{currentMetrics.posturalSwayIndex.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Equilibrium Score:</span>
                      <span className="font-medium">{currentMetrics.equilibriumScore.toFixed(1)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Walking Speed:</span>
                      <span className="font-medium">{currentMetrics.walkingSpeedEstimate.toFixed(2)} m/s</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button onClick={saveSnapshot} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save Snapshot
                  </Button>
                  <Button onClick={exportPDF} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                </div>

                {/* Saved Snapshots */}
                {snapshots.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Saved Snapshots ({snapshots.length})</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {snapshots.map((snapshot) => (
                        <div key={snapshot.id} className="text-sm p-2 bg-slate-50 rounded">
                          {new Date(snapshot.timestamp).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default GaitAnalysisPortal;