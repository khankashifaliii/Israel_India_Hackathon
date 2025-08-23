'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Activity, 
  Target, 
  TrendingUp, 
  FileText, 
  BarChart3,
  Users,
  Timer,
  Zap,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

interface PoseAnalysisResult {
  exercise_type?: 'squats' | 'pushups';
  summary: {
    total_steps?: number;
    total_strides?: number;
    average_step_length?: number;
    cadence?: number;
    total_reps?: number;
    total_time?: number;
    avg_time_per_rep?: number;
    posture_correct_time?: number;
    posture_correct_percentage?: number;
    joints_detected_count?: number;
    avg_depth_score?: number;
    avg_range_of_motion?: number;
    form_score?: number;
    quality_score: number;
  };
  kinematics: {
    joint_angles: Record<string, number[]>;
    range_of_motion: Record<string, {
      min: number;
      max: number;
      avg: number;
      range: number;
    }>;
  };
  balance_posture: {
    vertical_oscillation?: number;
    lateral_sway?: number;
    depth_consistency?: number;
    torso_stability?: number;
    shoulder_stability?: number;
    movement_consistency?: number;
  };
  symmetry: Record<string, number>;
  recommendations: string[];
  detailed_metrics: {
    step_lengths?: number[];
    gait_cycle_duration?: number;
    depth_scores?: number[];
    form_scores?: number[];
    squat_phases?: string[];
    range_of_motion_scores?: number[];
    pushup_phases?: string[];
    analysis_duration?: number;
  };
  detected_joints: string[];
  total_frames: number;
}

interface AnalysisResponse {
  success: boolean;
  message: string;
  results?: PoseAnalysisResult;
  error?: string;
}

const SessionAnalysisPortal = () => {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<PoseAnalysisResult | null>(null);
  const [exerciseType, setExerciseType] = useState<'squats' | 'pushups'>('squats');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        toast.success(`Selected file: ${file.name}`);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }

    setAnalysisState('uploading');
    setAnalysisProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('exercise_type', exerciseType);

      setAnalysisState('analyzing');
      setAnalysisProgress(30);

      const response = await fetch('http://localhost:8000/analyze-pose', {
        method: 'POST',
        body: formData,
      });

      setAnalysisProgress(70);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      
      setAnalysisProgress(90);

      if (data.success && data.results) {
        setAnalysisResults(data.results);
        setAnalysisState('complete');
        setAnalysisProgress(100);
        toast.success('Analysis completed successfully!');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisState('error');
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisResults) {
      toast.error('No analysis results to download');
      return;
    }

    try {
      const reportData = {
        ...analysisResults,
        exercise_type: exerciseType
      };
      
      const response = await fetch('http://localhost:8000/download-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `pose_analysis_report_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setAnalysisProgress(0);
    setSelectedFile(null);
    setAnalysisResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStateIcon = () => {
    switch (analysisState) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'analyzing':
      case 'uploading':
        return <Activity className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Upload className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStateMessage = () => {
    switch (analysisState) {
      case 'uploading':
        return 'Uploading file...';
      case 'analyzing':
        return 'Analyzing pose data...';
      case 'complete':
        return 'Analysis completed successfully!';
      case 'error':
        return 'Analysis failed. Please try again.';
      default:
        return 'Ready to analyze pose data';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Session Analysis Portal
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your pose estimation CSV files for comprehensive gait and movement analysis
          </p>
        </motion.div>

        {/* Exercise Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Exercise Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Select value={exerciseType} onValueChange={(value: 'squats' | 'pushups') => setExerciseType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="squats">Squats Analysis</SelectItem>
                    <SelectItem value="pushups">Push-ups Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3">
                  {getStateIcon()}
                  <span className="text-lg font-medium">{getStateMessage()}</span>
                </div>

                {analysisState === 'analyzing' || analysisState === 'uploading' ? (
                  <div className="space-y-2">
                    <Progress value={analysisProgress} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-gray-500">{analysisProgress}% complete</p>
                  </div>
                ) : null}

                {selectedFile && (
                  <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">{selectedFile.name}</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleUpload}
                    disabled={analysisState === 'analyzing' || analysisState === 'uploading'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFile ? 'Change File' : 'Select CSV File'}
                  </Button>
                  
                  <Button 
                    onClick={handleAnalyze}
                    disabled={!selectedFile || analysisState === 'analyzing' || analysisState === 'uploading'}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Start Analysis
                  </Button>

                  {analysisState !== 'idle' && (
                    <Button 
                      onClick={resetAnalysis}
                      variant="outline"
                      disabled={analysisState === 'analyzing' || analysisState === 'uploading'}
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {analysisResults && analysisState === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* First Metric - Reps Count */}
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups' 
                            ? `${analysisResults.exercise_type === 'pushups' ? 'Push-ups' : 'Squats'} Count`
                            : 'Total Steps'}
                        </p>
                        <p className="text-2xl font-bold">
                          {analysisResults.summary.total_reps ?? analysisResults.summary.total_steps ?? 0}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                {/* Second Metric - Time Taken */}
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups' 
                            ? 'Total Time'
                            : 'Avg Step Length'}
                        </p>
                        <p className="text-2xl font-bold">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups'
                            ? `${analysisResults.summary.total_time?.toFixed(1) ?? 0}s`
                            : `${analysisResults.summary.average_step_length?.toFixed(2) ?? 0}m`}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                {/* Third Metric - Posture Correct Time or Cadence */}
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups'
                            ? 'Posture Correct Time'
                            : 'Cadence'}
                        </p>
                        <p className="text-2xl font-bold">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups'
                            ? `${analysisResults.summary.posture_correct_time?.toFixed(1) ?? 0}s`
                            : `${analysisResults.summary.cadence?.toFixed(1) ?? 0} spm`}
                        </p>
                      </div>
                      <Timer className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                {/* Fourth Metric - Joints Detected or Quality Score */}
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups'
                            ? 'Joints Detected'
                            : 'Quality Score'}
                        </p>
                        <p className="text-2xl font-bold">
                          {analysisResults.exercise_type === 'squats' || analysisResults.exercise_type === 'pushups'
                            ? `${analysisResults.summary.joints_detected_count ?? 0}`
                            : `${analysisResults.summary.quality_score.toFixed(1)}%`}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Detailed Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="kinematics" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="kinematics">Kinematics</TabsTrigger>
                      <TabsTrigger value="balance">Balance & Posture</TabsTrigger>
                      <TabsTrigger value="symmetry">Symmetry</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    </TabsList>

                    <TabsContent value="kinematics" className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Range of Motion</h4>
                          <div className="space-y-2">
                            {Object.entries(analysisResults.kinematics.range_of_motion).map(([joint, rom]) => (
                              <div key={joint} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium capitalize">{joint.replace('_', ' ')}</span>
                                <Badge variant="secondary">{rom.range.toFixed(1)}°</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">Detected Joints</h4>
                          <div className="flex flex-wrap gap-2">
                            {analysisResults.detected_joints.map((joint) => (
                              <Badge key={joint} variant="outline" className="capitalize text-black">
                                {joint.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="balance" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-semibold mb-2">
                                {analysisResults.exercise_type === 'squats' 
                                  ? 'Depth Consistency'
                                  : analysisResults.exercise_type === 'pushups'
                                  ? 'Shoulder Stability'
                                  : 'Vertical Oscillation'}
                              </h4>
                              <p className="text-2xl font-bold text-blue-600">
                                {analysisResults.exercise_type === 'squats' 
                                  ? `${analysisResults.balance_posture.depth_consistency?.toFixed(1) ?? 0}%`
                                  : analysisResults.exercise_type === 'pushups'
                                  ? `${analysisResults.balance_posture.shoulder_stability?.toFixed(1) ?? 0}%`
                                  : `${analysisResults.balance_posture.vertical_oscillation?.toFixed(3) ?? 0}m`}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {analysisResults.exercise_type === 'squats' 
                                  ? 'Squat depth consistency'
                                  : analysisResults.exercise_type === 'pushups'
                                  ? 'Shoulder position stability'
                                  : 'Average displacement'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="text-center">
                              <h4 className="font-semibold mb-2">
                                {analysisResults.exercise_type === 'squats' 
                                  ? 'Torso Stability'
                                  : analysisResults.exercise_type === 'pushups'
                                  ? 'Movement Consistency'
                                  : 'Lateral Sway'}
                              </h4>
                              <p className="text-2xl font-bold text-green-600">
                                {analysisResults.exercise_type === 'squats' 
                                  ? `${analysisResults.balance_posture.torso_stability?.toFixed(1) ?? 0}%`
                                  : analysisResults.exercise_type === 'pushups'
                                  ? `${analysisResults.balance_posture.movement_consistency?.toFixed(1) ?? 0}%`
                                  : `${analysisResults.balance_posture.lateral_sway?.toFixed(3) ?? 0}m`}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {analysisResults.exercise_type === 'squats' 
                                  ? 'Torso alignment stability'
                                  : analysisResults.exercise_type === 'pushups'
                                  ? 'Movement pattern consistency'
                                  : 'Side-to-side movement'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="symmetry" className="space-y-4">
                      <div className="space-y-3">
                        {Object.entries(analysisResults.symmetry).map(([metric, value]) => (
                          <div key={metric} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium capitalize">{metric.replace('_', ' ')}</span>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={Math.abs(value) < 5 ? "default" : Math.abs(value) < 10 ? "secondary" : "destructive"}
                              >
                                {value.toFixed(1)}%
                              </Badge>
                              {Math.abs(value) < 5 && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="recommendations" className="space-y-4">
                      <div className="space-y-3">
                        {analysisResults.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-800">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Download Report */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Analysis Report</h3>
                      <p className="text-gray-600">Download a comprehensive report of your analysis</p>
                    </div>
                    <Button onClick={handleDownloadReport} className="bg-indigo-600 hover:bg-indigo-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SessionAnalysisPortal;