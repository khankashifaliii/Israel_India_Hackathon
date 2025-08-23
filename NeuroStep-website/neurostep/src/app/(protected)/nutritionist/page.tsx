'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Eye, 
  FileText, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  Droplets, 
  Pill,
  Utensils,
  TrendingUp,
  Heart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Types
type UserRole = 'nutritionist' | 'athlete';
type PlanGoal = 'weight-loss' | 'performance' | 'recovery' | 'maintenance';
type PlanStatus = 'active' | 'draft' | 'completed';
type RiskLevel = 'low' | 'medium' | 'high';

interface Athlete {
  id: string;
  name: string;
  email: string;
  lastSessionDate: string;
  riskLevel: RiskLevel;
  totalSessions: number;
  currentPlan?: string;
}

interface NutritionPlan {
  id: string;
  athleteId: string;
  athleteName: string;
  goal: PlanGoal;
  status: PlanStatus;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  hydration: number; // liters per day
  supplements: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface SessionReport {
  id: string;
  athleteId: string;
  athleteName: string;
  date: string;
  type: string;
  metrics: {
    reps?: number;
    avgPace?: number;
    rangeOfMotion?: number;
    symmetryIndex?: number;
    stabilityScore?: number;
  };
}

interface MealCard {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string;
  followed: boolean;
}

// Zod Schema for Plan Form
const planSchema = z.object({
  goal: z.enum(['weight-loss', 'performance', 'recovery', 'maintenance']),
  calories: z.number().min(1000).max(5000),
  protein: z.number().min(0).max(100),
  carbs: z.number().min(0).max(100),
  fats: z.number().min(0).max(100),
  hydration: z.number().min(1).max(10),
  supplements: z.string(),
  notes: z.string().max(500)
});

type PlanFormData = z.infer<typeof planSchema>;

// Mock Data
const mockAthletes: Athlete[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    lastSessionDate: '2024-01-15',
    riskLevel: 'low',
    totalSessions: 24,
    currentPlan: 'Performance Plan'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    lastSessionDate: '2024-01-14',
    riskLevel: 'medium',
    totalSessions: 18,
    currentPlan: 'Weight Loss Plan'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    lastSessionDate: '2024-01-10',
    riskLevel: 'high',
    totalSessions: 8
  }
];

const mockPlans: NutritionPlan[] = [
  {
    id: '1',
    athleteId: '1',
    athleteName: 'John Doe',
    goal: 'performance',
    status: 'active',
    calories: 2800,
    macros: { protein: 30, carbs: 45, fats: 25 },
    hydration: 3.5,
    supplements: ['Whey Protein', 'Creatine', 'Multivitamin'],
    notes: 'Focus on pre and post workout nutrition',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    athleteId: '2',
    athleteName: 'Jane Smith',
    goal: 'weight-loss',
    status: 'active',
    calories: 1800,
    macros: { protein: 35, carbs: 35, fats: 30 },
    hydration: 2.5,
    supplements: ['L-Carnitine', 'Green Tea Extract'],
    notes: 'Gradual caloric deficit with high protein',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-14'
  }
];

const mockReports: SessionReport[] = [
  {
    id: '1',
    athleteId: '1',
    athleteName: 'John Doe',
    date: '2024-01-15',
    type: 'Gait Analysis',
    metrics: {
      reps: 15,
      avgPace: 2.5,
      rangeOfMotion: 87.5,
      symmetryIndex: 0.92,
      stabilityScore: 88.2
    }
  }
];

const mockMealCards: MealCard[] = [
  {
    id: '1',
    type: 'breakfast',
    name: 'Power Breakfast Bowl',
    calories: 520,
    protein: 28,
    carbs: 45,
    fats: 22,
    ingredients: ['Oats', 'Greek Yogurt', 'Berries', 'Almonds', 'Honey'],
    instructions: 'Mix oats with yogurt, top with berries and almonds, drizzle honey',
    followed: false
  },
  {
    id: '2',
    type: 'lunch',
    name: 'Grilled Chicken Salad',
    calories: 450,
    protein: 35,
    carbs: 25,
    fats: 18,
    ingredients: ['Chicken Breast', 'Mixed Greens', 'Quinoa', 'Avocado', 'Olive Oil'],
    instructions: 'Grill chicken, serve over greens with quinoa and avocado',
    followed: true
  },
  {
    id: '3',
    type: 'dinner',
    name: 'Salmon & Sweet Potato',
    calories: 580,
    protein: 32,
    carbs: 38,
    fats: 26,
    ingredients: ['Salmon Fillet', 'Sweet Potato', 'Broccoli', 'Lemon', 'Herbs'],
    instructions: 'Bake salmon with herbs, roast sweet potato and steam broccoli',
    followed: false
  }
];

const NutritionistPortal = () => {
  // State
  const [userRole, setUserRole] = useState<UserRole>('nutritionist'); // This would come from auth context
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedReport, setSelectedReport] = useState<SessionReport | null>(null);
  const [plans, setPlans] = useState<NutritionPlan[]>(mockPlans);
  const [mealCards, setMealCards] = useState<MealCard[]>(mockMealCards);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Form
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      goal: 'performance',
      calories: 2000,
      protein: 25,
      carbs: 45,
      fats: 30,
      hydration: 2.5,
      supplements: '',
      notes: ''
    }
  });

  // Table Columns
  const columnHelper = createColumnHelper<Athlete>();
  const columns = [
    columnHelper.accessor('name', {
      header: 'Athlete Name',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-sm text-slate-500">{info.row.original.email}</div>
          </div>
        </div>
      )
    }),
    columnHelper.accessor('lastSessionDate', {
      header: 'Last Session',
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{new Date(info.getValue()).toLocaleDateString()}</span>
        </div>
      )
    }),
    columnHelper.accessor('riskLevel', {
      header: 'Risk Level',
      cell: (info) => {
        const risk = info.getValue();
        const colors = {
          low: 'bg-green-100 text-green-800 border-green-200',
          medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          high: 'bg-red-100 text-red-800 border-red-200'
        };
        return (
          <Badge className={colors[risk]}>
            {risk.toUpperCase()}
          </Badge>
        );
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedAthlete(info.row.original);
              const report = mockReports.find(r => r.athleteId === info.row.original.id);
              if (report) {
                setSelectedReport(report);
                setIsReportDrawerOpen(true);
              }
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Reports
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedAthlete(info.row.original);
              toast.info(`Creating plan for ${info.row.original.name}`);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Assign Plan
          </Button>
        </div>
      )
    })
  ];

  const table = useReactTable({
    data: mockAthletes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  // Form Handlers
  const onSubmitPlan = (data: PlanFormData) => {
    const newPlan: NutritionPlan = {
      id: Date.now().toString(),
      athleteId: selectedAthlete?.id || '1',
      athleteName: selectedAthlete?.name || 'Unknown',
      goal: data.goal,
      status: 'draft',
      calories: data.calories,
      macros: {
        protein: data.protein,
        carbs: data.carbs,
        fats: data.fats
      },
      hydration: data.hydration,
      supplements: data.supplements.split(',').map(s => s.trim()).filter(Boolean),
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPlans(prev => [...prev, newPlan]);
    toast.success('Nutrition plan created successfully!');
    form.reset();

    // Stub: Would normally save to Firestore
    console.log('Saving to Firestore plans collection:', newPlan);
  };

  const toggleMealFollowed = (mealId: string) => {
    setMealCards(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, followed: !meal.followed } : meal
    ));
    
    // Persist to localStorage for offline support
    const updatedMeals = mealCards.map(meal => 
      meal.id === mealId ? { ...meal, followed: !meal.followed } : meal
    );
    localStorage.setItem('mealProgress', JSON.stringify(updatedMeals));
  };

  const sendCommentToAthlete = (comment: string) => {
    const feedback = {
      id: Date.now().toString(),
      athleteId: selectedReport?.athleteId,
      reportId: selectedReport?.id,
      comment,
      timestamp: new Date().toISOString(),
      from: 'nutritionist'
    };

    toast.success('Comment sent to athlete!');
    console.log('Saving to Firestore feedback collection:', feedback);
  };

  // Load meal progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('mealProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setMealCards(parsed);
      } catch (e) {
        console.error('Failed to parse meal progress:', e);
      }
    }
  }, []);

  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: PlanStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  if (userRole === 'athlete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">My Nutrition Plans</h1>
            <p className="text-slate-600">Track your daily nutrition and hydration goals</p>
          </div>

          {/* Hydration Reminder */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Droplets className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">Daily Hydration Goal</h3>
                    <p className="text-blue-700">2.5L remaining today</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((glass) => (
                    <div key={glass} className="w-8 h-10 bg-blue-200 rounded-lg opacity-30" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealCards.map((meal) => (
              <motion.div
                key={meal.id}
                whileHover={{ 
                  y: -8, 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(59, 130, 246, 0.3)' 
                }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  meal.followed ? 'ring-2 ring-green-200 bg-green-50' : 'hover:ring-2 hover:ring-blue-200'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMealIcon(meal.type)}</span>
                        <CardTitle className="text-lg capitalize">{meal.type}</CardTitle>
                      </div>
                      <Badge variant={meal.followed ? 'default' : 'secondary'}>
                        {meal.followed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">{meal.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Target className="h-3 w-3" />
                          <span>{meal.calories} cal</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>{meal.protein}g protein</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-700">Ingredients:</h4>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {meal.ingredients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{meal.ingredients.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`meal-${meal.id}`}
                          checked={meal.followed}
                          onCheckedChange={() => toggleMealFollowed(meal.id)}
                        />
                        <Label 
                          htmlFor={`meal-${meal.id}`} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          Mark as followed
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Subtle hover effect */}
                  <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50/50 to-slate-50/50" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Daily Summary */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Today's Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {mealCards.filter(m => m.followed).length}/{mealCards.length}
                  </div>
                  <div className="text-sm text-slate-600">Meals Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {mealCards.reduce((acc, m) => m.followed ? acc + m.calories : acc, 0)}
                  </div>
                  <div className="text-sm text-slate-600">Calories Consumed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">
                    {mealCards.reduce((acc, m) => m.followed ? acc + m.protein : acc, 0)}g
                  </div>
                  <div className="text-sm text-slate-600">Protein Intake</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">85%</div>
                  <div className="text-sm text-slate-600">Goal Achievement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Nutritionist View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Nutritionist Portal</h1>
            <p className="text-slate-600">Manage athlete nutrition plans and track progress</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setUserRole(userRole === 'nutritionist' ? 'athlete' : 'nutritionist')}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              Switch to {userRole === 'nutritionist' ? 'Athlete' : 'Nutritionist'} View
            </Button>
          </div>
        </div>

        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 border-slate-200">
            <TabsTrigger value="athletes" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900">Athletes Overview</TabsTrigger>
            <TabsTrigger value="plans" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900">Plans & Feedback</TabsTrigger>
            <TabsTrigger value="reports" className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900">Session Reports</TabsTrigger>
          </TabsList>

          {/* Athletes Overview Tab */}
          <TabsContent value="athletes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>Athletes Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search athletes..."
                    value={globalFilter ?? ''}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans & Feedback Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* New Plan Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    <span>Create New Plan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmitPlan)} className="space-y-4">
                    <div>
                      <Label htmlFor="goal">Goal</Label>
                      <Select onValueChange={(value: PlanGoal) => form.setValue('goal', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="performance">Performance</SelectItem>
                          <SelectItem value="recovery">Recovery</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="calories">Daily Calories</Label>
                        <Input
                          type="number"
                          {...form.register('calories', { valueAsNumber: true })}
                          placeholder="2000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hydration">Hydration (L/day)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          {...form.register('hydration', { valueAsNumber: true })}
                          placeholder="2.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="protein">Protein %</Label>
                        <Input
                          type="number"
                          {...form.register('protein', { valueAsNumber: true })}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbs">Carbs %</Label>
                        <Input
                          type="number"
                          {...form.register('carbs', { valueAsNumber: true })}
                          placeholder="45"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fats">Fats %</Label>
                        <Input
                          type="number"
                          {...form.register('fats', { valueAsNumber: true })}
                          placeholder="30"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="supplements">Supplements (comma-separated)</Label>
                      <Input
                        {...form.register('supplements')}
                        placeholder="Whey Protein, Creatine, Multivitamin"
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        {...form.register('notes')}
                        placeholder="Additional notes and instructions..."
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Create Plan
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Existing Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Existing Plans</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{plan.athleteName}</h3>
                          <Badge className={getStatusColor(plan.status)}>
                            {plan.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          <div>Goal: {plan.goal.replace('-', ' ')}</div>
                          <div>Calories: {plan.calories}/day</div>
                          <div>Macros: P{plan.macros.protein}% C{plan.macros.carbs}% F{plan.macros.fats}%</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Session Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Session reports will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Viewer Drawer */}
        <Sheet open={isReportDrawerOpen} onOpenChange={setIsReportDrawerOpen}>
          <SheetContent className="w-[600px] sm:w-[800px]">
            <SheetHeader>
              <SheetTitle>Session Report</SheetTitle>
              <SheetDescription>
                {selectedReport && `${selectedReport.athleteName} - ${selectedReport.date}`}
              </SheetDescription>
            </SheetHeader>
            
            {selectedReport && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Session Metrics</h3>
                    <div className="space-y-1 text-sm">
                      <div>Reps: {selectedReport.metrics.reps}</div>
                      <div>Avg Pace: {selectedReport.metrics.avgPace}s</div>
                      <div>Range of Motion: {selectedReport.metrics.rangeOfMotion}%</div>
                      <div>Symmetry Index: {selectedReport.metrics.symmetryIndex}</div>
                      <div>Stability Score: {selectedReport.metrics.stabilityScore}/100</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Send Comment to Athlete</h3>
                  <Textarea
                    placeholder="Enter your feedback for the athlete..."
                    rows={4}
                    id="comment-textarea"
                  />
                  <Button
                    onClick={() => {
                      const textarea = document.getElementById('comment-textarea') as HTMLTextAreaElement;
                      if (textarea.value.trim()) {
                        sendCommentToAthlete(textarea.value);
                        textarea.value = '';
                      }
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Comment
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default NutritionistPortal;