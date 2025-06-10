
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, AlertTriangle } from "lucide-react";

interface AttendanceStatsProps {
  stats: {
    perfect: number;
    good: number;
    poor: number;
    absent: number;
  };
}

const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  const total = stats.perfect + stats.good + stats.poor + stats.absent;
  
  const statItems = [
    {
      label: 'Perfect',
      count: stats.perfect,
      percentage: total > 0 ? Math.round((stats.perfect / total) * 100) : 0,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: UserCheck,
      description: '25+ days'
    },
    {
      label: 'Good',
      count: stats.good,
      percentage: total > 0 ? Math.round((stats.good / total) * 100) : 0,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      icon: Users,
      description: '15-24 days'
    },
    {
      label: 'Poor',
      count: stats.poor,
      percentage: total > 0 ? Math.round((stats.poor / total) * 100) : 0,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: AlertTriangle,
      description: '1-14 days'
    },
    {
      label: 'Absent',
      count: stats.absent,
      percentage: total > 0 ? Math.round((stats.absent / total) * 100) : 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: UserX,
      description: '0 days'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <Card 
          key={item.label}
          className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in ${item.bgColor} border-2 hover:border-primary/20`}
          style={{ 
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'both'
          }}
        >
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <item.icon className="h-8 w-8" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <div className={`text-2xl font-bold ${item.textColor} transition-all duration-300 group-hover:scale-110`}>
                {item.count}
              </div>
              
              <p className="text-sm font-medium text-foreground mb-1">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              
              <Badge 
                variant="outline" 
                className={`mt-2 ${item.textColor} border-current transition-all duration-200 hover:scale-105`}
              >
                {item.percentage}%
              </Badge>
            </div>

            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AttendanceStats;
