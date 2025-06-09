import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, UserCheck, UserX, Zap, Upload, FileText, Download, MessageCircle, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnalysisDisplay from "@/components/AnalysisDisplay";

const Index = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingResults, setProcessingResults] = useState(null);
  const [isWaitingForResults, setIsWaitingForResults] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [analysisOutput, setAnalysisOutput] = useState<string | null>(null);
  const { toast } = useToast();

  // Updated to production webhook URL
  const webhookUrl = "https://visheshsanghvi.app.n8n.cloud/webhook/anayzed";
  
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
    setAnalysisOutput(null);
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
        // Parse the response to get the analysis results
        const responseData = await response.json();
        console.log("Response data:", responseData);
        
        // Extract the analysis output from the response structure
        if (responseData && Array.isArray(responseData) && responseData[0]?.output) {
          const output = responseData[0].output;
          setAnalysisOutput(output);
          setIsWaitingForResults(false);
          
          toast({
            title: "Analysis completed!",
            description: "Your file has been analyzed successfully.",
          });
        } else {
          // Handle case where response structure is different - no fake results
          setIsWaitingForResults(false);
          
          toast({
            title: "Processing completed",
            description: "File uploaded and processed successfully.",
          });
        }
        
        setSelectedFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        console.log("File upload and processing completed successfully");
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
    if (!analysisOutput) return;
    
    const dataStr = analysisOutput;
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analysis_results_${new Date().toISOString().split('T')[0]}.txt`;
    
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
            <h1 className="text-3xl font-bold">Code Analysis Tool</h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered code analysis from uploaded documents
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
              Upload Code Document
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
                  Processing your file in n8n workflow...
                </p>
                <p className="text-xs mt-1">Job ID: {jobId}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX
            </p>
          </CardContent>
        </Card>

        {/* Analysis Results - Beautiful Display */}
        {analysisOutput && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  Analysis Complete
                </span>
                <Button variant="outline" size="sm" onClick={downloadResults}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnalysisDisplay content={analysisOutput} />
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!analysisOutput && !isWaitingForResults && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
              <p className="text-muted-foreground">
                Upload your code document above to get AI-powered analysis results.
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
                <p className="text-sm text-muted-foreground mb-2">Analysis Webhook (Production URL):</p>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  {webhookUrl}
                </code>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>• The app sends POST requests with JSON payload containing file data</p>
                <p>• Real-time analysis results are displayed in beautiful structured format</p>
                <p>• Employee data is automatically parsed and categorized by attendance</p>
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
