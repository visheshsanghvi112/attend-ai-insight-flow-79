
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, TrendingUp, FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AttendanceOverview from "@/components/AttendanceOverview";
import EmployeeList from "@/components/EmployeeList";
import AnalyticsChart from "@/components/AnalyticsChart";
import ReportUpload from "@/components/ReportUpload";

const Index = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState("idle");
  const { toast } = useToast();

  const webhookUrl = "https://visheshsanghvi.app.n8n.cloud/webhook-test/efbd6621-7def-4bc0-b324-cc5fab654969";

  // Simulate receiving data from webhook
  useEffect(() => {
    // In a real implementation, this would be a WebSocket or polling mechanism
    // For demo purposes, we'll simulate some data
    const mockData = {
      totalEmployees: 150,
      presentToday: 142,
      absentToday: 8,
      avgAttendance: 94.7,
      lastUpdated: new Date().toISOString(),
      employees: [
        { id: 1, name: "John Doe", checkIn: "09:15", checkOut: "18:30", status: "Present", department: "Engineering" },
        { id: 2, name: "Jane Smith", checkIn: "09:00", checkOut: "17:45", status: "Present", department: "Marketing" },
        { id: 3, name: "Mike Johnson", checkIn: null, checkOut: null, status: "Absent", department: "Sales" },
        { id: 4, name: "Sarah Wilson", checkIn: "08:45", checkOut: "18:00", status: "Present", department: "HR" },
      ]
    };
    
    setTimeout(() => {
      setAttendanceData(mockData);
      setIsConnected(true);
      setWebhookStatus("connected");
    }, 1500);
  }, []);

  const testWebhookConnection = async () => {
    setWebhookStatus("testing");
    
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: "attendance-analyzer",
          message: "Testing webhook connection"
        }),
      });

      setWebhookStatus("connected");
      toast({
        title: "Webhook Test Sent",
        description: "Test payload sent to n8n workflow. Check your n8n execution history.",
      });
    } catch (error) {
      console.error("Webhook test failed:", error);
      setWebhookStatus("error");
      toast({
        title: "Connection Test Failed",
        description: "Could not reach the n8n webhook. Please verify the URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Attendance Analyzer</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional attendance management powered by AI analysis of fingerprint machine reports
          </p>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected to n8n Workflow' : 'Awaiting Connection'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testWebhookConnection}
              disabled={webhookStatus === "testing"}
            >
              <Zap className="h-4 w-4 mr-2" />
              {webhookStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AttendanceOverview data={attendanceData} />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <EmployeeList employees={attendanceData?.employees || []} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsChart />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportUpload webhookUrl={webhookUrl} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-6">
          <p>Powered by AI • Connected to n8n Workflow • Real-time Processing</p>
          <p className="mt-1">Last updated: {attendanceData?.lastUpdated ? new Date(attendanceData.lastUpdated).toLocaleString() : 'Never'}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
