
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles } from "lucide-react";

interface AnalysisSummaryProps {
  summary: string;
  totalEmployees: number;
}

const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({ summary, totalEmployees }) => {
  return (
    <Card className="animate-fade-in overflow-hidden bg-gradient-to-br from-background to-primary/5 border-2 hover:border-primary/20 transition-all duration-300">
      <CardHeader className="relative">
        <div className="absolute top-4 right-4 opacity-10">
          <Sparkles className="h-12 w-12" />
        </div>
        <CardTitle className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          Analysis Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {summary || "Analysis completed successfully. Employee attendance data extracted and categorized below."}
            </p>
          </div>
          
          {totalEmployees > 0 && (
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">Total Employees Analyzed:</span>
              </div>
              <div className="px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-bold text-primary">{totalEmployees}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full" />
      </CardContent>
    </Card>
  );
};

export default AnalysisSummary;
