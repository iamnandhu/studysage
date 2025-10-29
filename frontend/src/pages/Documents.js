import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { FileText, Upload, Trash2, Eye, Sparkles, Brain, BookOpen } from 'lucide-react';

const Documents = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
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
      setDocuments([response.data, ...documents]);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [documents]);

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

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`/documents/${documentId}`);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleGenerateSummary = async (documentId) => {
    try {
      toast.loading('Generating summary...');
      await axios.post(`/ai/summarize/${documentId}`);
      toast.success('Summary generated! Check Study Materials.');
    } catch (error) {
      console.error('Summary error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('text')) return '📃';
    if (fileType?.includes('image')) return '🖼️';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="documents-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="documents-heading">My Documents</h1>
            <p className="text-gray-600">Upload and manage your study materials</p>
          </div>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="upload-document-btn">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="upload-dialog">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload PDF, DOCX, TXT, JPG, or PNG files
                </DialogDescription>
              </DialogHeader>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-testid="dropzone"
              >
                <input {...getInputProps()} data-testid="file-input" />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">Drag & drop a file here, or click to select</p>
                    <p className="text-sm text-gray-400">Supported: PDF, DOCX, TXT, JPG, PNG</p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="mb-2" />
                  <p className="text-sm text-center text-gray-600">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="skeleton h-48" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-state">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-600 mb-4">Upload your first document to get started</p>
            <Button
              onClick={() => setShowUploadDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="empty-upload-btn"
            >
              Upload Document
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="card-hover" data-testid={`document-card-${doc.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{getFileIcon(doc.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium truncate" data-testid={`doc-name-${doc.id}`}>
                        {doc.filename}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(doc.uploaded_at).toLocaleDateString()} • {(doc.file_size / 1024).toFixed(1)} KB
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/reading/${doc.id}`)}
                      data-testid={`view-doc-btn-${doc.id}`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleGenerateSummary(doc.id)}
                      data-testid={`summarize-btn-${doc.id}`}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Summarize
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(doc.id)}
                      data-testid={`delete-btn-${doc.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;