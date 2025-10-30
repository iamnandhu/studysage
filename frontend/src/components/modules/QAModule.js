import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DocumentUploadDialog from '@/components/DocumentUploadDialog';
import DocumentList from '@/components/DocumentList';
import axios from 'axios';
import { toast } from 'sonner';
import { Send, Brain, FileText, ExternalLink, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const QAModule = ({ session, onUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [qaHistory, setQaHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSources, setSelectedSources] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [includeGlobalDocs, setIncludeGlobalDocs] = useState(false);

  useEffect(() => {
    fetchData();
  }, [session.id]);

  useEffect(() => {
    fetchData();
  }, [includeGlobalDocs]);

  const fetchData = async () => {
    try {
      const [messagesRes, docsRes] = await Promise.all([
        axios.get(`/sessions/${session.id}/messages`),
        // Fetch documents for this session
        axios.get('/documents', { params: { session_id: session.id } })
      ]);
      
      setMessages(messagesRes.data);
      // Filter documents based on includeGlobalDocs setting
      let filteredDocs = includeGlobalDocs 
        ? docsRes.data.filter(doc => doc.session_id === session.id || doc.is_global)
        : docsRes.data.filter(doc => doc.session_id === session.id);
      
      setDocuments(filteredDocs);
      
      // Extract Q&A pairs from messages
      const qaPairs = [];
      for (let i = 0; i < messagesRes.data.length; i += 2) {
        if (messagesRes.data[i] && messagesRes.data[i + 1]) {
          qaPairs.push({
            question: messagesRes.data[i].content,
            answer: messagesRes.data[i + 1].content,
            sources: messagesRes.data[i + 1].sources || []
          });
        }
      }
      setQaHistory(qaPairs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = { role: 'user', content: inputMessage, sources: [] };
    setMessages([...messages, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      await axios.post(`/sessions/${session.id}/messages`, userMsg);
      
      // Use RAG-enhanced Q&A endpoint
      const response = await axios.post('/ai/qa-rag', {
        question: inputMessage,
        session_id: session.id
      });

      const aiMsg = { 
        role: 'assistant', 
        content: response.data.answer, 
        sources: response.data.sources || []
      };
      await axios.post(`/sessions/${session.id}/messages`, aiMsg);
      
      setMessages(prev => [...prev, aiMsg]);
      setSelectedSources(response.data.sources || []);
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex" data-testid="qa-module">
      {/* Left Column - Q&A History */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold">Q&A History</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{qaHistory.length} questions</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {qaHistory.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No questions yet</p>
                <p className="text-xs mt-1">Ask your first question!</p>
              </div>
            ) : (
              qaHistory.map((qa, idx) => (
                <Card key={idx} className="card-hover cursor-pointer" onClick={() => setSelectedSources(qa.sources)}>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium mb-2 line-clamp-2">{qa.question}</p>
                    <div className="text-xs text-muted-foreground line-clamp-2 prose prose-xs max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {String(qa.answer || '')}
                      </ReactMarkdown>
                    </div>
                    {qa.sources.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                        <ExternalLink className="w-3 h-3" />
                        <span>{qa.sources.length} source(s)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Center Column - Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/50 bg-card/30">
          <h2 className="font-semibold">{session.name}</h2>
          <p className="text-xs text-muted-foreground">
            {documents.length > 0 ? `${documents.length} document(s) loaded` : 'No documents uploaded'}
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Ask Your Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Get precise answers from your documents with citations
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}>
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {String(msg.content || '')}
                        </ReactMarkdown>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs opacity-70 mb-2">Sources:</p>
                          {msg.sources.map((source, sidx) => (
                            <div key={sidx} className="text-xs opacity-70 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{source.filename} {source.page ? `(Page ${source.page})` : ''}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <Card className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-card/30">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              placeholder="Ask a question about your documents..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              className="resize-none"
              rows={1}
            />
            <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Sources & Documents */}
      <div className="w-80 border-l border-border/50 flex flex-col bg-card/30">
        <Tabs defaultValue="sources" className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sources">Sources</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sources" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              {selectedSources.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No sources yet</p>
                  <p className="text-xs mt-1">Sources will appear here when you ask questions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSources.map((source, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{source.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              Referenced in answer {source.page ? `• Page ${source.page}` : ''}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="documents" className="flex-1 m-0">
            <ScrollArea className="h-full p-4">
              <DocumentList documents={documents} onDocumentDeleted={fetchData} />
            </ScrollArea>
          </TabsContent>

          <div className="p-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowUpload(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </Tabs>
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

export default QAModule;