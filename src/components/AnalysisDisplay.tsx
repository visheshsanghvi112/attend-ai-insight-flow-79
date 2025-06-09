
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AnalysisDisplayProps {
  content: string;
}

interface EmployeeData {
  name: string;
  id: string;
  daysPresent: number;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content }) => {
  // Parse the content to extract structured data
  const parseEmployeeData = (text: string): EmployeeData[] => {
    const employees: EmployeeData[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Match pattern: **NAME (ID):** X days present
      const match = line.match(/\*\*([^(]+)\(([^)]+)\):\*\*\s*(\d+)\s*days?\s*present?/i);
      if (match) {
        employees.push({
          name: match[1].trim(),
          id: match[2].trim(),
          daysPresent: parseInt(match[3])
        });
      }
    });
    
    return employees;
  };

  // Extract summary text (everything before the employee list)
  const extractSummary = (text: string): string => {
    const lines = text.split('\n');
    const summaryLines = [];
    
    for (const line of lines) {
      if (line.match(/\*\*.*\(.*\):\*\*/)) break;
      if (line.trim()) summaryLines.push(line.trim());
    }
    
    return summaryLines.join(' ');
  };

  const employees = parseEmployeeData(content);
  const summary = extractSummary(content);
  
  // Categorize employees by attendance
  const perfectAttendance = employees.filter(emp => emp.daysPresent >= 25);
  const goodAttendance = employees.filter(emp => emp.daysPresent >= 15 && emp.daysPresent < 25);
  const poorAttendance = employees.filter(emp => emp.daysPresent > 0 && emp.daysPresent < 15);
  const absent = employees.filter(emp => emp.daysPresent === 0);

  const getAttendanceIcon = (days: number) => {
    if (days >= 25) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (days >= 15) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (days > 0) return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getAttendanceBadgeVariant = (days: number) => {
    if (days >= 25) return "default";
    if (days >= 15) return "secondary";
    if (days > 0) return "secondary";
    return "destructive";
  };

  const AttendanceSection = ({ title, employees, bgColor }: { title: string, employees: EmployeeData[], bgColor: string }) => {
    if (employees.length === 0) return null;
    
    return (
      <div className={`${bgColor} p-4 rounded-lg border`}>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          {getAttendanceIcon(employees[0]?.daysPresent || 0)}
          {title} ({employees.length})
        </h4>
        <div className="grid gap-3">
          {employees.map((employee, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-background rounded border">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.id}</p>
                </div>
              </div>
              <Badge variant={getAttendanceBadgeVariant(employee.daysPresent)} className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {employee.daysPresent} days
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Employee Statistics */}
      {employees.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{perfectAttendance.length}</div>
              <p className="text-sm text-muted-foreground">Perfect Attendance</p>
              <p className="text-xs text-muted-foreground">(25+ days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{goodAttendance.length}</div>
              <p className="text-sm text-muted-foreground">Good Attendance</p>
              <p className="text-xs text-muted-foreground">(15-24 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">{poorAttendance.length}</div>
              <p className="text-sm text-muted-foreground">Poor Attendance</p>
              <p className="text-xs text-muted-foreground">(1-14 days)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{absent.length}</div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-xs text-muted-foreground">(0 days)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Details by Category */}
      {employees.length > 0 && (
        <div className="space-y-4">
          <AttendanceSection 
            title="Perfect Attendance" 
            employees={perfectAttendance} 
            bgColor="bg-green-50 border-green-200" 
          />
          <AttendanceSection 
            title="Good Attendance" 
            employees={goodAttendance} 
            bgColor="bg-yellow-50 border-yellow-200" 
          />
          <AttendanceSection 
            title="Poor Attendance" 
            employees={poorAttendance} 
            bgColor="bg-orange-50 border-orange-200" 
          />
          <AttendanceSection 
            title="Absent Employees" 
            employees={absent} 
            bgColor="bg-red-50 border-red-200" 
          />
        </div>
      )}

      {/* Fallback for unstructured content */}
      {employees.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDisplay;
