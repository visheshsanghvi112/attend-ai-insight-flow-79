
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EmployeeData {
  name: string;
  id?: string;
  daysPresent: number;
}

interface AttendanceOverviewProps {
  employees: EmployeeData[];
}

const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({ employees }) => {
  const getAttendanceIcon = (days: number) => {
    if (days >= 25) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (days >= 15) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    if (days > 0) return <TrendingDown className="h-4 w-4 text-orange-500" />;
    return <Minus className="h-4 w-4 text-red-500" />;
  };

  const getAttendanceBadgeVariant = (days: number) => {
    if (days >= 25) return "default";
    if (days >= 15) return "secondary";
    if (days > 0) return "secondary";
    return "destructive";
  };

  const getAttendanceStatus = (days: number) => {
    if (days >= 25) return 'Excellent';
    if (days >= 15) return 'Good';
    if (days > 0) return 'Poor';
    return 'Absent';
  };

  const getAttendancePercentage = (days: number) => Math.min((days / 25) * 100, 100);

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Employee Attendance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Attendance</TableHead>
                <TableHead className="font-semibold">Progress</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee, index) => {
                const percentage = getAttendancePercentage(employee.daysPresent);
                return (
                  <TableRow 
                    key={index} 
                    className="hover:bg-muted/20 transition-colors duration-200 animate-fade-in"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{employee.name}</p>
                          {employee.id && <p className="text-xs text-muted-foreground">{employee.id}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getAttendanceBadgeVariant(employee.daysPresent)} 
                        className="transition-all duration-200 hover:scale-105"
                      >
                        {employee.daysPresent} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out ${
                              percentage >= 100 ? 'bg-green-500' :
                              percentage >= 60 ? 'bg-yellow-500' :
                              percentage > 0 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: `${percentage}%`,
                              animationDelay: `${index * 50 + 200}ms`
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground min-w-[30px]">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAttendanceIcon(employee.daysPresent)}
                        <span className="text-sm font-medium">
                          {getAttendanceStatus(employee.daysPresent)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceOverview;
