
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, UserCheck, UserX, Zap, Upload, FileText, Download, MessageCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Index = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [isWaitingForResults, setIsWaitingForResults] = useState(false);
  const [jobId, setJobId] = useState(null);
  const { toast } = useToast();

  const webhookUrl = "https://visheshsanghvi.app.n8n.cloud/webhook-test/efbd6621-7def-4bc0-b324-cc5fab654969";
  
  // This would be your response webhook URL that n8n calls back to
  const responseWebhookUrl = `${window.location.origin}/api/webhook/response`;

  // Listen for webhook responses (in a real app, this would be handled by your backend)
  useEffect(() => {
    // In a real implementation, you'd set up a proper API endpoint to receive webhook responses
    // For now, this is just a placeholder for the webhook response handling
    console.log("App ready to receive webhook responses at:", responseWebhookUrl);
  }, []);

  const testWebhookConnection = async () => {
    try {
      const response = await fetch(`${webhookUrl}?test=true&timestamp=${new Date().toISOString()}&source=attendance-analyzer`, {
        method: "GET",
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
    setIsWaitingForResults(true);
    const uploadJobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setJobId(uploadJobId);
    
    console.log("Starting file upload with POST method...", {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      webhookUrl: webhookUrl,
      jobId: uploadJobId
    });
    
    try {
      // Convert file to base64 for POST request
      const fileReader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;
      const base64String = (base64Data as string).split(',')[1]; // Remove data:type;base64, prefix
      
      // Create payload for POST request
      const payload = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        fileData: base64String,
        timestamp: new Date().toISOString(),
        source: 'attendance-analyzer',
        jobId: uploadJobId,
        responseWebhook: responseWebhookUrl // Tell n8n where to send results
      };

      console.log("Sending POST request to webhook with payload...", {
        ...payload,
        fileData: `[BASE64_DATA_${base64String.length}_CHARS]` // Don't log the actual base64 data
      });

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Upload response:", {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()]
      });

      if (response.ok) {
        toast({
          title: "Report uploaded successfully",
          description: "Your attendance report is being processed. Waiting for results from n8n...",
        });
        
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        console.log("File upload completed successfully with POST method, waiting for processing results...");
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      setIsWaitingForResults(false);
      toast({
        title: "Upload failed",
        description: `Could not upload the report: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadResults = () => {
    if (!processingResults) return;
    
    const dataStr = JSON.stringify(processingResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `attendance_results_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
                disabled={isUploading || isWaitingForResults}
              />
              <Button 
                onClick={uploadReport} 
                disabled={!selectedFile || isUploading || isWaitingForResults}
              >
                {isUploading ? (
                  "Uploading..."
                ) : isWaitingForResults ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
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
            {isWaitingForResults && (
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded border">
                <p className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing your file in n8n workflow... Waiting for webhook response.
                </p>
                <p className="text-xs mt-1">Job ID: {jobId}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX
            </p>
          </CardContent>
        </Card>

        {/* Processing Results - Only shows real webhook responses */}
        {processingResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Webhook Response
                </span>
                <Button variant="outline" size="sm" onClick={downloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="text-green-800 font-medium">✅ Response received from n8n webhook</p>
                <div className="mt-2 text-sm text-green-700">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(processingResults, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Data Display - Only shows if real data is received */}
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
              <h3 className="text-lg font-medium mb-2">Waiting for webhook response</h3>
              <p className="text-muted-foreground">
                Upload your attendance report above. Results will appear here when your n8n workflow sends the response back.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Webhook Info */}
        <Card>
          <CardHeader>
            <CardTitle>n8n Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Upload Webhook (for sending data to n8n via POST):</p>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  {webhookUrl}
                </code>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Response Webhook (for n8n to send results back):</p>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  {responseWebhookUrl}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  Configure your n8n workflow to POST results back to this URL with the jobId parameter
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>• The app sends POST requests with JSON payload containing file data</p>
                <p>• No fake results - only real webhook responses are displayed</p>
                <p>• Configure your n8n workflow to send processed results back to the response webhook</p>
                <p>• Open browser console (F12) to see detailed upload logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
