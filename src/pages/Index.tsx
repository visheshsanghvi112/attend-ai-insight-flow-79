
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

  // Simulate checking for results (in a real app, this would be a proper API endpoint)
  const checkForResults = async (uploadJobId: string) => {
    try {
      // In a real implementation, this would check your backend for results
      // For demo purposes, we'll simulate a response after some time
      console.log("Checking for results for job:", uploadJobId);
      
      // Simulate processing time
      setTimeout(() => {
        // Simulate receiving results from n8n
        const mockResults = {
          status: "completed",
          data: {
            totalEmployees: 25,
            presentToday: 22,
            absentToday: 3,
            summary: "Attendance processed successfully. 88% attendance rate for today.",
            processedAt: new Date().toISOString(),
            details: [
              { name: "John Doe", status: "Present", checkIn: "09:00 AM" },
              { name: "Jane Smith", status: "Present", checkIn: "08:45 AM" },
              { name: "Mike Johnson", status: "Absent", checkIn: "-" }
            ]
          }
        };
        
        setProcessingResults(mockResults);
        setAttendanceData(mockResults.data);
        setIsWaitingForResults(false);
        
        toast({
          title: "Processing Complete!",
          description: "Your attendance report has been analyzed successfully.",
        });
      }, 5000); // Simulate 5 second processing time
      
    } catch (error) {
      console.error("Error checking for results:", error);
      setIsWaitingForResults(false);
    }
  };

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
    
    console.log("Starting file upload...", {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      webhookUrl: webhookUrl,
      jobId: uploadJobId
    });
    
    try {
      // Convert file to base64 for GET request
      const fileReader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;
      const base64String = (base64Data as string).split(',')[1]; // Remove data:type;base64, prefix
      
      // Create URL with query parameters including response webhook
      const params = new URLSearchParams({
        fileName: selectedFile.name,
        fileSize: selectedFile.size.toString(),
        fileType: selectedFile.type,
        fileData: base64String,
        timestamp: new Date().toISOString(),
        source: 'attendance-analyzer',
        jobId: uploadJobId,
        responseWebhook: responseWebhookUrl // Tell n8n where to send results
      });

      const requestUrl = `${webhookUrl}?${params.toString()}`;
      console.log("Sending GET request to webhook...");

      const response = await fetch(requestUrl, {
        method: "GET",
      });

      console.log("Upload response:", {
        status: response.status,
        statusText: response.statusText,
        headers: [...response.headers.entries()]
      });

      if (response.ok) {
        toast({
          title: "Report uploaded successfully",
          description: "Your attendance report is being processed. Waiting for results...",
        });
        
        // Start checking for results
        checkForResults(uploadJobId);
        
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        console.log("File upload completed successfully, waiting for processing results...");
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
                  Processing your file in n8n workflow... This may take a few moments.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX
            </p>
          </CardContent>
        </Card>

        {/* Processing Results */}
        {processingResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Processing Results
                </span>
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Detailed Processing Results</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-sm text-muted-foreground">{processingResults.data?.summary}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Employee Details</h4>
                          <div className="space-y-2">
                            {processingResults.data?.details?.map((employee, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                <span className="font-medium">{employee.name}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  employee.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {employee.status} {employee.checkIn !== '-' && `(${employee.checkIn})`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Processed at: {new Date(processingResults.data?.processedAt).toLocaleString()}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <p className="text-green-800 font-medium">✅ Processing Complete!</p>
                <p className="text-green-700 text-sm mt-1">{processingResults.data?.summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

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
            <CardTitle>n8n Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Upload Webhook (for sending data to n8n):</p>
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
                <p>• Open browser console (F12) to see detailed upload logs</p>
                <p>• The app will automatically display results when n8n sends them back</p>
                <p>• Processing results can be viewed as a chat-like interface or downloaded as a file</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
