'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Apple, 
  Utensils, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus,
  CheckCircle,
  AlertCircle,
  Droplets,
  Zap,
  Heart,
  Activity
} from 'lucide-react';
import { useState } from 'react';

export default function NutritionPage() {
  const [selectedDay, setSelectedDay] = useState('today');

  const nutritionStats = {
    calories: { consumed: 1850, target: 2200, percentage: 84 },
    protein: { consumed: 125, target: 150, percentage: 83 },
    carbs: { consumed: 180, target: 220, percentage: 82 },
    fats: { consumed: 65, target: 80, percentage: 81 },
    water: { consumed: 6, target: 8, percentage: 75 }
  };

  const mealPlan = [
    {
      id: 1,
      meal: 'Breakfast',
      time: '08:00',
      items: ['Oatmeal with berries', 'Greek yogurt', 'Green tea'],
      calories: 420,
      completed: true,
      protein: 18,
      carbs: 65,
      fats: 12
    },
    {
      id: 2,
      meal: 'Mid-Morning Snack',
      time: '10:30',
      items: ['Protein shake', 'Banana'],
      calories: 280,
      completed: true,
      protein: 25,
      carbs: 35,
      fats: 5
    },
    {
      id: 3,
      meal: 'Lunch',
      time: '13:00',
      items: ['Grilled chicken salad', 'Quinoa', 'Avocado'],
      calories: 520,
      completed: true,
      protein: 35,
      carbs: 45,
      fats: 22
    },
    {
      id: 4,
      meal: 'Afternoon Snack',
      time: '16:00',
      items: ['Mixed nuts', 'Apple'],
      calories: 320,
      completed: false,
      protein: 12,
      carbs: 25,
      fats: 18
    },
    {
      id: 5,
      meal: 'Dinner',
      time: '19:30',
      items: ['Salmon fillet', 'Sweet potato', 'Steamed broccoli'],
      calories: 480,
      completed: false,
      protein: 35,
      carbs: 35,
      fats: 18
    }
  ];

  const recommendations = [
    {
      type: 'hydration',
      title: 'Increase Water Intake',
      description: 'You\'re 25% below your daily water goal. Try to drink 2 more glasses.',
      priority: 'medium',
      icon: Droplets
    },
    {
      type: 'protein',
      title: 'Post-Workout Protein',
      description: 'Consider adding a protein shake after your evening gait session.',
      priority: 'high',
      icon: Zap
    },
    {
      type: 'recovery',
      title: 'Anti-Inflammatory Foods',
      description: 'Include more omega-3 rich foods to support joint recovery.',
      priority: 'low',
      icon: Heart
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/10 text-red-400';
      case 'medium': return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
      case 'low': return 'border-lime-500/30 bg-lime-500/10 text-lime-400';
      default: return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Nutrition Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your daily nutrition intake and optimize your diet for better gait performance.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
            <Calendar className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Log Food
          </Button>
        </div>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Calories', ...nutritionStats.calories, unit: 'kcal', color: 'text-purple-400', icon: Zap },
          { label: 'Protein', ...nutritionStats.protein, unit: 'g', color: 'text-cyan-400', icon: Activity },
          { label: 'Carbs', ...nutritionStats.carbs, unit: 'g', color: 'text-orange-400', icon: Apple },
          { label: 'Fats', ...nutritionStats.fats, unit: 'g', color: 'text-lime-400', icon: Droplets },
          { label: 'Water', ...nutritionStats.water, unit: 'glasses', color: 'text-blue-400', icon: Droplets }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-2 ${stat.color}`} />
                      <span className="text-sm text-black">{stat.label}</span>
                    </div>
                    <span className={`text-xs font-semibold ${stat.color}`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-semibold">
                        {stat.consumed} {stat.unit}
                      </span>
                      <span className="text-black">
                        / {stat.target} {stat.unit}
                      </span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Plan */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Utensils className="h-5 w-5 mr-2 text-lime-400" />
                Today's Meal Plan
              </CardTitle>
              <CardDescription>
                Your personalized nutrition plan optimized for gait training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealPlan.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    meal.completed 
                      ? 'bg-lime-500/10 border-lime-500/30' 
                      : 'bg-background/30 border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-black">{meal.meal}</h4>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {meal.time}
                        </Badge>
                        <Badge className={`${meal.completed ? 'bg-lime-500/20 text-lime-400 border-lime-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                          {meal.completed ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Completed</>
                          ) : (
                            <><AlertCircle className="h-3 w-3 mr-1" />Pending</>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-black mb-3">
                        {meal.items.join(' • ')}
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div className="text-center">
                          <div className="text-purple-400 font-semibold">{meal.calories}</div>
                          <div className="text-black">kcal</div>
                        </div>
                        <div className="text-center">
                          <div className="text-cyan-400 font-semibold">{meal.protein}g</div>
                          <div className="text-black">protein</div>
                        </div>
                        <div className="text-center">
                          <div className="text-orange-400 font-semibold">{meal.carbs}g</div>
                          <div className="text-black">carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lime-400 font-semibold">{meal.fats}g</div>
                          <div className="text-black">fats</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!meal.completed && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-400" />
                Recommendations
              </CardTitle>
              <CardDescription>
                Personalized nutrition tips for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => {
                const Icon = rec.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start">
                      <Icon className="h-5 w-5 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">{rec.title}</h4>
                        <p className="text-sm opacity-80">{rec.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Nutrition Score</span>
                  <span className="text-cyan-400 font-semibold">87/100</span>
                </div>
                <Progress value={87} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Goal Adherence</span>
                  <span className="text-lime-400 font-semibold">92%</span>
                </div>
                <Progress value={92} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-black">Hydration</span>
                  <span className="text-orange-400 font-semibold">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}