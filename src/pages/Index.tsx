
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, UserCheck, UserX, Zap, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const webhookUrl = "https://visheshsanghvi.app.n8n.cloud/webhook-test/efbd6621-7def-4bc0-b324-cc5fab654969";

  const testWebhookConnection = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: "attendance-analyzer"
        }),
      });

      console.log("Test response status:", response.status);
      setIsConnected(true);
      toast({
        title: "Test sent to n8n workflow",
        description: "Check your n8n execution history.",
      });
    } catch (error) {
      console.error("Connection test error:", error);
      toast({
        title: "Connection failed",
        description: "Could not reach the n8n webhook.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file);
    
    if (file && (file.type === "application/pdf" || 
                 file.type === "application/msword" || 
                 file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                 file.name.toLowerCase().endsWith('.pdf') ||
                 file.name.toLowerCase().endsWith('.doc') ||
                 file.name.toLowerCase().endsWith('.docx'))) {
      setSelectedFile(file);
      console.log("File accepted:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
    } else {
      console.log("File rejected:", file);
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or Word document.",
        variant: "destructive",
      });
    }
  };

  const uploadReport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    console.log("Starting file upload...", {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      webhookUrl: webhookUrl
    });
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
      formData.append('fileName', selectedFile.name);
      formData.append('fileSize', selectedFile.size.toString());
      formData.append('fileType', selectedFile.type);
      formData.append('timestamp', new Date().toISOString());
      formData.append('source', 'attendance-analyzer');

      console.log("FormData prepared, sending to webhook...");
      
      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData ${key}:`, value);
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Upload response:", {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()]
      });

      if (response.ok || response.status === 0) {
        toast({
          title: "Report uploaded successfully",
          description: "Your attendance report is being processed. Check your n8n workflow execution.",
        });
        
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        console.log("File upload completed successfully");
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: `Could not upload the report: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Attendance Analyzer</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered attendance processing from fingerprint machine reports
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm">
                {isConnected ? 'Connected to n8n' : 'Not connected'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={testWebhookConnection}>
              <Zap className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </div>

        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Attendance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button 
                onClick={uploadReport} 
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                <p>Selected: {selectedFile.name}</p>
                <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Type: {selectedFile.type || 'Unknown'}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX
            </p>
          </CardContent>
        </Card>

        {/* Attendance Data Display */}
        {attendanceData ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Total Employees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceData.totalEmployees}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                  Present Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{attendanceData.presentToday}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UserX className="h-4 w-4 mr-2 text-red-600" />
                  Absent Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{attendanceData.absentToday}</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Waiting for attendance data</h3>
              <p className="text-muted-foreground">
                Upload your fingerprint machine report above to see attendance data here.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Webhook Info */}
        <Card>
          <CardHeader>
            <CardTitle>n8n Webhook Endpoint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Connected to:</p>
              <code className="block p-3 bg-muted rounded text-sm break-all">
                {webhookUrl}
              </code>
              <p className="text-xs text-muted-foreground">
                Open browser console (F12) to see detailed upload logs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
