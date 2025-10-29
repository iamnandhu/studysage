import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import DocumentUploadDialog from '@/components/DocumentUploadDialog';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, Send, FileText, Sparkles, GitBranch, Headphones, Calendar, Target } from 'lucide-react';

const ExamPrepModule = ({ session, onUpdate }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [documents, setDocuments] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);

  useEffect(() => {
    fetchData();
  }, [session.id]);

  const fetchData = async () => {
    try {
      const [messagesRes, docsRes, materialsRes] = await Promise.all([
        axios.get(`/sessions/${session.id}/messages`),
        axios.get('/documents', { params: { session_id: session.id } }),
        axios.get('/study-materials')
      ]);
      
      setMessages(messagesRes.data);
      setDocuments(docsRes.data);
      setSummaries(materialsRes.data.filter(m => m.type === 'summary'));
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
      
      // AI Response
      const response = await axios.post('/ai/qa', {
        question: inputMessage,
        document_id: null
      });

      const aiMsg = { role: 'assistant', content: response.data.answer, sources: [] };
      await axios.post(`/sessions/${session.id}/messages`, aiMsg);
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async (docId) => {
    try {
      toast.loading('Generating summary...');
      await axios.post(`/ai/summarize/${docId}`);
      toast.success('Summary generated!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    }
  };

  return (
    <div className="h-screen flex" data-testid="exam-prep-module">
      {/* Left Column - Summaries */}
      <div className="w-80 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold">Study Materials</h2>
          </div>
          {session.config?.exam_name && (
            <p className="text-xs text-muted-foreground">{session.config.exam_name}</p>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
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
              documents.map((doc) => {
                const summary = summaries.find(s => s.document_id === doc.id);
                return (
                  <Card key={doc.id} className="card-hover">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{doc.filename}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {summary ? (
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {summary.content.summary?.substring(0, 100)}...
                        </p>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleGenerateSummary(doc.id)}
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Generate Summary
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>

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
      </div>

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        sessionId={session.id}
        onUploadComplete={fetchData}
      />

      {/* Center Column - Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/50 bg-card/30">
          <h2 className="font-semibold">{session.name}</h2>
          <p className="text-xs text-muted-foreground">Ask questions about your study materials</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Start Your Study Session</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your documents or request study help
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
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
              placeholder="Ask a question or request study help..."
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

      {/* Right Column - Tools */}
      <div className="w-80 border-l border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold">Study Tools</h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('Mindmap feature coming soon!')}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Generate Mindmap
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('Flashcards feature coming soon!')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Flashcards
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('Audio summary feature coming soon!')}
            >
              <Headphones className="w-4 h-4 mr-2" />
              Audio Summary
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => toast.info('Podcast feature coming soon!')}
            >
              <Headphones className="w-4 h-4 mr-2" />
              Generate Podcast
            </Button>

            {session.config?.exam_date && (
              <Card className="mt-4">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Exam Date
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <p className="text-xs">{session.config.exam_date}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ExamPrepModule;
