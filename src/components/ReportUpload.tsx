
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportUploadProps {
  webhookUrl: string;
}

const ReportUpload = ({ webhookUrl }: ReportUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([
    {
      id: 1,
      fileName: "attendance_report_2024_06_08.pdf",
      uploadTime: "2024-06-08 14:30:00",
      status: "processed",
      employeesProcessed: 150,
      processingTime: "2.3s"
    },
    {
      id: 2,
      fileName: "daily_attendance_07_06.docx",
      uploadTime: "2024-06-07 16:45:00",
      status: "processed",
      employeesProcessed: 148,
      processingTime: "1.8s"
    }
  ]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', new Date().toISOString());
      formData.append('source', 'attendance-analyzer');
      formData.append('fileType', file.type);

      console.log("Uploading file to n8n workflow:", file.name);

      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      // Simulate processing result
      const newUpload = {
        id: Date.now(),
        fileName: file.name,
        uploadTime: new Date().toLocaleString(),
        status: "processed" as const,
        employeesProcessed: Math.floor(Math.random() * 50) + 100,
        processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`
      };

      setUploadHistory(prev => [newUpload, ...prev]);

      toast({
        title: "File Uploaded Successfully",
        description: `${file.name} has been sent to the n8n workflow for AI processing.`,
      });

    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload file to n8n workflow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const sendTestReport = async () => {
    setIsProcessing(true);

    try {
      const testData = {
        test: true,
        reportType: "fingerprint_attendance",
        timestamp: new Date().toISOString(),
        mockData: {
          totalEmployees: 150,
          presentToday: 142,
          absentToday: 8,
          reportDate: new Date().toISOString().split('T')[0]
        }
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(testData),
      });

      toast({
        title: "Test Report Sent",
        description: "Test attendance data sent to n8n workflow for processing.",
      });

    } catch (error) {
      console.error("Test report failed:", error);
      toast({
        title: "Test Failed",
        description: "Could not send test report to n8n workflow.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed":
        return "bg-green-100 text-green-800 border-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Attendance Reports</span>
          </CardTitle>
          <CardDescription>
            Upload PDF or Word documents from your fingerprint machine for AI processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Select Report File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Drag and drop your attendance report or click to browse
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="max-w-xs mx-auto"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Supports PDF and Word documents up to 10MB
              </p>
            </div>
          </div>

          {/* Test Button */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-blue-900">Test n8n Workflow</h4>
              <p className="text-sm text-blue-700">Send test data to verify your workflow is working</p>
            </div>
            <Button 
              onClick={sendTestReport} 
              disabled={isProcessing}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? "Sending..." : "Send Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing History */}
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
          <CardDescription>
            Recent uploads and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No reports uploaded yet</p>
              <p className="text-sm">Upload your first attendance report to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadHistory.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(upload.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{upload.fileName}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded: {upload.uploadTime}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm text-gray-600">
                      <p>{upload.employeesProcessed} employees processed</p>
                      <p>Processing time: {upload.processingTime}</p>
                    </div>
                    <Badge className={getStatusColor(upload.status)}>
                      {upload.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Info */}
      <Card>
        <CardHeader>
          <CardTitle>n8n Webhook Configuration</CardTitle>
          <CardDescription>
            Current webhook endpoint for your attendance processing workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  value={webhookUrl} 
                  readOnly 
                  className="font-mono text-sm bg-gray-50"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    toast({ title: "Copied to clipboard" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-1">Important Note</h4>
              <p className="text-sm text-yellow-800">
                Make sure your n8n workflow is configured to accept file uploads and process attendance data. 
                The AI should extract employee names, check-in/out times, and generate structured attendance data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportUpload;
