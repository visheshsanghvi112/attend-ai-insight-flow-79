
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import AnalysisSummary from './analysis/AnalysisSummary';
import AttendanceStats from './analysis/AttendanceStats';
import AttendanceOverview from './analysis/AttendanceOverview';
import AttendanceCategories from './analysis/AttendanceCategories';

interface AnalysisDisplayProps {
  content: string;
}

interface EmployeeData {
  name: string;
  id?: string;
  daysPresent: number;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ content }) => {
  // Enhanced parsing to handle multiple formats including tables
  const parseEmployeeData = (text: string): EmployeeData[] => {
    const employees: EmployeeData[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      // Pattern 1: **NAME (ID):** X days present
      let match = line.match(/\*\*([^(]+)\(([^)]+)\):\*\*\s*(\d+(?:\.\d+)?)\s*days?\s*present?/i);
      if (match) {
        employees.push({
          name: match[1].trim(),
          id: match[2].trim(),
          daysPresent: parseFloat(match[3])
        });
        return;
      }
      
      // Pattern 2: **NAME (ID):** X (without "days present")
      match = line.match(/\*\*([^(]+)\(([^)]+)\):\*\*\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        employees.push({
          name: match[1].trim(),
          id: match[2].trim(),
          daysPresent: parseFloat(match[3])
        });
        return;
      }
      
      // Pattern 3: * **NAME (ID):** X (with bullet point)
      match = line.match(/\*\s*\*\*([^(]+)\(([^)]+)\):\*\*\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        employees.push({
          name: match[1].trim(),
          id: match[2].trim(),
          daysPresent: parseFloat(match[3])
        });
        return;
      }

      // Pattern 4: Table row format: | NAME | DAYS |
      match = line.match(/\|\s*([^|]+?)\s*\|\s*(\d+(?:\.\d+)?)\s*\|/);
      if (match && !match[1].toLowerCase().includes('employee') && !match[1].toLowerCase().includes('name')) {
        const name = match[1].trim();
        if (name && name !== '---' && name !== '-') {
          employees.push({
            name: name,
            daysPresent: parseFloat(match[2])
          });
        }
        return;
      }

      // Pattern 5: Simple format: NAME | DAYS
      match = line.match(/^([A-Z\s\(\)]+)\s*\|\s*(\d+(?:\.\d+)?)\s*$/);
      if (match) {
        employees.push({
          name: match[1].trim(),
          daysPresent: parseFloat(match[2])
        });
        return;
      }

      // Pattern 6: Markdown table format with name and days
      match = line.match(/\|\s*([^|]+)\s*\|\s*(\d+(?:\.\d+)?)\s*\|/);
      if (match && match[1] && !match[1].includes('-') && !match[1].toLowerCase().includes('employee') && !match[1].toLowerCase().includes('name')) {
        const name = match[1].trim();
        if (name.length > 0) {
          employees.push({
            name: name,
            daysPresent: parseFloat(match[2])
          });
        }
        return;
      }
    });
    
    // Remove duplicates
    const uniqueEmployees = employees.filter((emp, index, self) => 
      index === self.findIndex(e => e.name === emp.name)
    );
    
    return uniqueEmployees;
  };

  // Enhanced summary extraction
  const extractSummary = (text: string): string => {
    const lines = text.split('\n');
    const summaryLines = [];
    let foundEmployeeList = false;
    
    for (const line of lines) {
      // Stop when we hit employee data or tables
      if (line.match(/\*\*.*\(.*\):\*\*/) || 
          line.match(/\*\s*\*\*.*\(.*\):\*\*/) ||
          line.match(/\|\s*[^|]+\s*\|\s*\d+/) ||
          line.includes('Employee Name') ||
          line.includes('Days Present')) {
        foundEmployeeList = true;
        break;
      }
      if (line.trim() && !line.startsWith('*') && !line.includes('**') && !line.includes('|')) {
        summaryLines.push(line.trim());
      }
    }
    
    return summaryLines.join(' ').trim();
  };

  const employees = parseEmployeeData(content);
  const summary = extractSummary(content);
  
  // Categorize employees by attendance
  const perfectAttendance = employees.filter(emp => emp.daysPresent >= 25);
  const goodAttendance = employees.filter(emp => emp.daysPresent >= 15 && emp.daysPresent < 25);
  const poorAttendance = employees.filter(emp => emp.daysPresent > 0 && emp.daysPresent < 15);
  const absent = employees.filter(emp => emp.daysPresent === 0);

  const stats = {
    perfect: perfectAttendance.length,
    good: goodAttendance.length,
    poor: poorAttendance.length,
    absent: absent.length
  };

  return (
    <div className="space-y-8">
      {/* Analysis Summary */}
      <AnalysisSummary summary={summary} totalEmployees={employees.length} />

      {/* Attendance Statistics - Only show if we have employee data */}
      {employees.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <AttendanceStats stats={stats} />
        </div>
      )}

      {/* Attendance Overview Table */}
      {employees.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <AttendanceOverview employees={employees} />
        </div>
      )}

      {/* Employee Categories */}
      {employees.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <AttendanceCategories 
            perfectAttendance={perfectAttendance}
            goodAttendance={goodAttendance}
            poorAttendance={poorAttendance}
            absent={absent}
          />
        </div>
      )}

      {/* Fallback for any other content */}
      {employees.length === 0 && content && (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {content}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisDisplay;
