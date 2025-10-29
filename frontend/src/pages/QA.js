import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { Brain, Send, FileText, Sparkles } from 'lucide-react';

const QA = ({ user, onLogout }) => {
  const [question, setQuestion] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [documents, setDocuments] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      type: 'user',
      text: question,
      timestamp: new Date()
    };

    setConversation([...conversation, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post('/ai/qa', {
        question,
        document_id: selectedDocument && selectedDocument !== 'none' ? selectedDocument : null
      });

      const aiMessage = {
        type: 'ai',
        text: response.data.answer,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, aiMessage]);
      setQuestion('');
    } catch (error) {
      console.error('QA error:', error);
      toast.error(error.response?.data?.detail || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="qa-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="qa-heading">Homework Assistant</h1>
          <p className="text-gray-600">Ask any question and get detailed explanations</p>
        </div>

        {/* Document Selector */}
        <Card className="mb-6" data-testid="document-selector-card">
          <CardHeader>
            <CardTitle className="text-base">Optional: Select a document for context</CardTitle>
            <CardDescription>Choose a document to ask questions about</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDocument} onValueChange={setSelectedDocument}>
              <SelectTrigger data-testid="document-select">
                <SelectValue placeholder="No document selected" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No document</SelectItem>
                {documents.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id} data-testid={`doc-option-${doc.id}`}>
                    {doc.filename}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Conversation */}
        <div className="mb-6 space-y-4" data-testid="conversation-container">
          {conversation.length === 0 ? (
            <Card className="text-center p-12" data-testid="empty-conversation">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ask your first question</h3>
              <p className="text-gray-600">Get instant help with homework, concepts, and more</p>
            </Card>
          ) : (
            conversation.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${index}`}
              >
                <Card
                  className={`max-w-[80%] ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white'
                  }`}
                >
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start" data-testid="loading-indicator">
              <Card className="max-w-[80%] bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Input Form */}
        <Card data-testid="question-input-card">
          <CardContent className="p-4">
            <form onSubmit={handleAskQuestion} className="space-y-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="min-h-[100px] resize-none"
                disabled={loading}
                data-testid="question-textarea"
              />

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {user.subscription_status === 'active' ? (
                    <span className="text-green-600 font-medium">✓ Unlimited questions</span>
                  ) : (
                    <span>1 credit per question • {user.credits} credits remaining</span>
                  )}
                </p>

                <Button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="ask-question-btn"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask Question
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QA;