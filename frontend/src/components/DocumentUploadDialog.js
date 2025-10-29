import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const DocumentUploadDialog = ({ open, onClose, sessionId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGlobal, setIsGlobal] = useState('session');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId || '');
    formData.append('is_global', isGlobal === 'global' ? 'true' : 'false');
    formData.append('is_exam_prep', 'false');

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      toast.success('Document uploaded successfully!');
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [sessionId, isGlobal, onClose, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-morphism" data-testid="upload-dialog">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload PDF, DOCX, TXT, JPG, or PNG files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-3 block">Document Access</Label>
            <RadioGroup value={isGlobal} onValueChange={setIsGlobal}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="session" id="session" />
                <Label htmlFor="session" className="flex-1 cursor-pointer">
                  <div className="font-medium">This Session Only</div>
                  <div className="text-xs text-muted-foreground">Available only in this session</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="global" id="global" />
                <Label htmlFor="global" className="flex-1 cursor-pointer">
                  <div className="font-medium">All Sessions</div>
                  <div className="text-xs text-muted-foreground">Access across all your sessions</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            data-testid="dropzone"
          >
            <input {...getInputProps()} data-testid="file-input" />
            {!uploading ? (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-foreground font-medium mb-2">Drag & drop a file here, or click to select</p>
                    <p className="text-sm text-muted-foreground">Supported: PDF, DOCX, TXT, JPG, PNG</p>
                    <p className="text-xs text-muted-foreground mt-1">Max file size: 50MB</p>
                  </div>
                )}
              </>
            ) : (
              <div>
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-sm font-medium mb-2">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          {uploading && (
            <div>
              <Progress value={uploadProgress} className="mb-2" />
              <p className="text-xs text-center text-muted-foreground">Processing your document...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
