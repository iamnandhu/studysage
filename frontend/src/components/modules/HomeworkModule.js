import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentUploadDialog from '@/components/DocumentUploadDialog';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Sparkles, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const HomeworkModule = ({ session, onUpdate }) => {
  const [documents, setDocuments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchData();
  }, [session.id]);

  const fetchData = async () => {
    try {
      const [docsRes, materialsRes] = await Promise.all([
        axios.get('/documents', { params: { session_id: session.id } }),
        axios.get('/study-materials')
      ]);
      
      setDocuments(docsRes.data);
      setSummaries(materialsRes.data.filter(m => m.type === 'summary'));
      
      if (docsRes.data.length > 0 && !selectedDoc) {
        setSelectedDoc(docsRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleGenerateSummary = async (docId) => {
    setLoading(true);
    try {
      toast.loading('Generating detailed summary...');
      await axios.post(`/ai/summarize/${docId}`);
      toast.success('Summary generated!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentSummary = (docId) => {
    return summaries.find(s => s.document_id === docId);
  };

  return (
    <div className="h-screen flex" data-testid="homework-module">
      {/* Left Sidebar - Document List */}
      <div className="w-72 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold">Documents</h2>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No documents yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowUpload(true)}
                >
                  Upload Document
                </Button>
              </div>
            ) : (
              documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`card-hover cursor-pointer ${
                    selectedDoc?.id === doc.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-2">{doc.filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Summary View */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border/50 bg-card/30">
          <h1 className="text-2xl font-bold mb-1">{session.name}</h1>
          <p className="text-sm text-muted-foreground">
            {selectedDoc ? selectedDoc.filename : 'Select a document to view summary'}
          </p>
        </div>

        <ScrollArea className="flex-1">
          {!selectedDoc ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Upload or select a document to view detailed summaries
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-8">
              {(() => {
                const summary = getDocumentSummary(selectedDoc.id);
                if (!summary) {
                  return (
                    <Card className="glass-morphism">
                      <CardContent className="p-12 text-center">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Generate Summary</h3>
                        <p className="text-muted-foreground mb-6">
                          Get a detailed, in-depth summary of this document
                        </p>
                        <Button
                          onClick={() => handleGenerateSummary(selectedDoc.id)}
                          disabled={loading}
                          className="bg-primary"
                        >
                          {loading ? 'Generating...' : 'Generate Summary'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <div className="space-y-6 animate-slide-up">
                    <Card className="glass-morphism">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          Detailed Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {summary.content.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => toast.info('Flashcards feature coming soon!')}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Flashcards
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => toast.info('Mindmap feature coming soon!')}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Mindmap
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        sessionId={session.id}
        onUploadComplete={fetchData}
      />
    </div>
  );
};

export default HomeworkModule;