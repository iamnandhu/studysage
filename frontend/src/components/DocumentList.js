import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Calendar, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const DocumentList = ({ documents, onDocumentDeleted, selectedDoc, onDocumentSelect }) => {
  const handleDelete = async (docId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this document? This action cannot be undone.')) return;

    try {
      await axios.delete(`/api/documents/${docId}`);
      toast.success('Document deleted');
      if (onDocumentDeleted) onDocumentDeleted();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete document');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className={`card-hover ${
            onDocumentSelect ? 'cursor-pointer' : ''
          } ${selectedDoc?.id === doc.id ? 'border-primary bg-primary/5' : ''} overflow-hidden`}
          onClick={() => onDocumentSelect && onDocumentSelect(doc)}
        >
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate block">{doc.filename}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10 flex-shrink-0"
                onClick={(e) => handleDelete(doc.id, e)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{formatFileSize(doc.file_size || 0)}</span>
                {doc.page_count && (
                  <span className="ml-2">• {doc.page_count} pages</span>
                )}
              </div>
              {doc.uploaded_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(doc.uploaded_at)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  doc.is_global ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {doc.is_global ? 'Global' : 'Session'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentList;
