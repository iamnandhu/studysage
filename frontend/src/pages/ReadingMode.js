import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Type, Sparkles, BookOpen, Eye, Moon, Sun } from 'lucide-react';

const ReadingMode = ({ user, onLogout }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');
  const [darkMode, setDarkMode] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.8);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get('/documents');
      const doc = response.data.find(d => d.id === documentId);
      
      if (!doc) {
        toast.error('Document not found');
        navigate('/documents');
        return;
      }
      
      setDocument(doc);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      toast.loading('Generating summary...');
      await axios.post(`/ai/summarize/${documentId}`);
      toast.success('Summary generated! Check Study Materials.');
    } catch (error) {
      console.error('Summary error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate summary');
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      toast.loading('Creating flashcards...');
      await axios.post(`/ai/flashcards/${documentId}`);
      toast.success('Flashcards created! Check Study Materials.');
    } catch (error) {
      console.error('Flashcards error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create flashcards');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-amber-50 text-gray-900'
    }`} data-testid="reading-mode-page">
      {/* Floating Control Panel */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <Card className={`p-4 shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/documents')}
              data-testid="back-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              data-testid="theme-toggle-btn"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={14}
                max={24}
                step={1}
                className="w-24"
                data-testid="font-size-slider"
              />
              <span className="text-sm w-8">{fontSize}px</span>
            </div>

            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-32" data-testid="font-family-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="sans">Sans</SelectItem>
                <SelectItem value="mono">Mono</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              data-testid="generate-summary-btn"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Summarize
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateFlashcards}
              data-testid="generate-flashcards-btn"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Flashcards
            </Button>
          </div>
        </Card>
      </div>

      {/* Document Content */}
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="document-title">{document.filename}</h1>
          <p className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
          </p>
        </div>

        <Card className={`p-8 md:p-12 shadow-lg ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <div
            className="prose max-w-none"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontFamily === 'serif' 
                ? 'Georgia, serif' 
                : fontFamily === 'sans' 
                ? 'Inter, sans-serif' 
                : 'monospace'
            }}
            data-testid="document-content"
          >
            {document.content_preview ? (
              <div className="whitespace-pre-wrap">{document.content_preview}</div>
            ) : (
              <div className={`text-center py-12 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Preview not available for this file type</p>
                <p className="text-sm mt-2">Generate a summary or flashcards to study this content</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReadingMode;