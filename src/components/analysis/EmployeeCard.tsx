
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EmployeeCardProps {
  employee: {
    name: string;
    id?: string;
    daysPresent: number;
  };
  index: number;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, index }) => {
  const getAttendanceStatus = (days: number) => {
    if (days >= 25) return { status: 'excellent', color: 'bg-green-500', icon: TrendingUp };
    if (days >= 15) return { status: 'good', color: 'bg-yellow-500', icon: TrendingUp };
    if (days > 0) return { status: 'poor', color: 'bg-orange-500', icon: TrendingDown };
    return { status: 'absent', color: 'bg-red-500', icon: Minus };
  };

  const getAttendancePercentage = (days: number) => Math.min((days / 25) * 100, 100);

  const { status, color, icon: StatusIcon } = getAttendanceStatus(employee.daysPresent);
  const percentage = getAttendancePercentage(employee.daysPresent);

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in bg-gradient-to-br from-background to-background/50 border-2 hover:border-primary/20`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'both'
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <StatusIcon className={`h-4 w-4 ${status === 'excellent' || status === 'good' ? 'text-green-600' : status === 'poor' ? 'text-orange-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                {employee.name}
              </h3>
              {employee.id && (
                <p className="text-xs text-muted-foreground truncate">ID: {employee.id}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Progress Ring */}
          <div className="flex items-center justify-between">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted stroke-current opacity-20"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="2"
                />
                <path
                  className={`${color.replace('bg-', 'text-')} stroke-current transition-all duration-1000 ease-out`}
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ 
                    animationDelay: `${index * 100 + 300}ms`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold">{Math.round(percentage)}%</span>
              </div>
            </div>
            
            <div className="text-right">
              <Badge 
                variant={status === 'excellent' ? 'default' : status === 'good' ? 'secondary' : 'destructive'} 
                className="flex items-center gap-1 transition-all duration-200 hover:scale-105"
              >
                <Calendar className="h-3 w-3" />
                {employee.daysPresent} days
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{status}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
