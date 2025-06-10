
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import EmployeeCard from './EmployeeCard';

interface EmployeeData {
  name: string;
  id?: string;
  daysPresent: number;
}

interface AttendanceCategoriesProps {
  perfectAttendance: EmployeeData[];
  goodAttendance: EmployeeData[];
  poorAttendance: EmployeeData[];
  absent: EmployeeData[];
}

const AttendanceCategories: React.FC<AttendanceCategoriesProps> = ({
  perfectAttendance,
  goodAttendance,
  poorAttendance,
  absent
}) => {
  const categories = [
    {
      title: 'Perfect Attendance',
      employees: perfectAttendance,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      description: '25+ days present'
    },
    {
      title: 'Good Attendance',
      employees: goodAttendance,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 border-yellow-200',
      description: '15-24 days present'
    },
    {
      title: 'Poor Attendance',
      employees: poorAttendance,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200',
      description: '1-14 days present'
    },
    {
      title: 'Absent Employees',
      employees: absent,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200',
      description: '0 days present'
    }
  ];

  return (
    <div className="space-y-6">
      {categories.map((category, categoryIndex) => {
        if (category.employees.length === 0) return null;
        
        return (
          <Card 
            key={category.title}
            className={`animate-fade-in overflow-hidden ${category.bgColor} border-2 hover:shadow-lg transition-all duration-300`}
            style={{ 
              animationDelay: `${categoryIndex * 200}ms`,
              animationFillMode: 'both'
            }}
          >
            <CardHeader className="pb-4">
              <CardTitle className={`flex items-center gap-3 ${category.color}`}>
                <div className="relative">
                  <category.icon className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 min-w-[24px] h-5 flex items-center justify-center">
                      {category.employees.length}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground font-normal">{category.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.employees.map((employee, index) => (
                  <EmployeeCard 
                    key={`${employee.name}-${index}`} 
                    employee={employee} 
                    index={index}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AttendanceCategories;
