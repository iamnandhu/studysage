import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { Image as ImageIcon, Upload, X, Sparkles, Clock, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDropzone } from 'react-dropzone';

const HomeworkModule = ({ session, onUpdate }) => {
  const [homeworks, setHomeworks] = useState([]);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);

  useEffect(() => {
    fetchHomeworks();
  }, [session.id]);

  const fetchHomeworks = async () => {
    try {
      const response = await axios.get(`/api/sessions/${session.id}/messages`);
      // Group messages into homework pairs (image + solution)
      const hwList = [];
      for (let i = 0; i < response.data.length; i += 2) {
        if (response.data[i] && response.data[i + 1]) {
          hwList.push({
            id: `hw-${i}`,
            imageUrl: response.data[i].content,
            question: response.data[i].question || 'Homework Question',
            solution: response.data[i + 1].content,
            timestamp: response.data[i].timestamp || new Date().toISOString(),
            status: response.data[i + 1].content ? 'solved' : 'pending'
          });
        }
      }
      setHomeworks(hwList);
    } catch (error) {
      console.error('Error fetching homeworks:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadingImage({
        file,
        preview: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  });

  const handleSolveHomework = async () => {
    if (!uploadingImage) return;

    setLoading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', uploadingImage.file);
      formData.append('session_id', session.id);

      // Upload image and get solution
      toast.loading('Analyzing homework...');
      const response = await axios.post('/api/homework/solve', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Homework solved!');
      setUploadingImage(null);
      fetchHomeworks();
    } catch (error) {
      console.error('Error solving homework:', error);
      toast.error(error.response?.data?.detail || 'Failed to solve homework');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen flex" data-testid="homework-module">
      {/* Left Sidebar - Homework History */}
      <div className="w-72 border-r border-border/50 flex flex-col bg-card/30">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold">Homework History</h2>
          </div>
          <p className="text-xs text-muted-foreground">{homeworks.length} solved</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {homeworks.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No homework yet</p>
                <p className="text-xs mt-1">Upload an image to get started</p>
              </div>
            ) : (
              homeworks.map((hw) => (
                <Card
                  key={hw.id}
                  className={`card-hover cursor-pointer overflow-hidden ${
                    selectedHomework?.id === hw.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedHomework(hw)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={hw.imageUrl}
                        alt="Homework"
                        className="w-16 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{hw.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(hw.timestamp)}</span>
                          </div>
                          {hw.status === 'solved' && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content - Homework Solver */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-border/50 bg-card/30">
          <h1 className="text-2xl font-bold mb-1">{session.name}</h1>
          <p className="text-sm text-muted-foreground">
            Upload an image of your homework to get instant solutions
          </p>
        </div>

        <ScrollArea className="flex-1">
          {!selectedHomework && !uploadingImage ? (
            <div className="flex items-center justify-center h-full p-8">
              <Card className="w-full max-w-2xl">
                <CardContent className="p-12">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Upload Homework Image</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDragActive
                        ? 'Drop your image here'
                        : 'Drag and drop an image, or click to browse'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: JPG, PNG, GIF, WebP (Max 10MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : uploadingImage ? (
            <div className="max-w-4xl mx-auto p-8">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      Preview & Solve
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadingImage(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={uploadingImage.preview}
                      alt="Homework preview"
                      className="w-full max-h-96 object-contain bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hw-name">Homework Name (optional)</Label>
                    <Input
                      id="hw-name"
                      placeholder="e.g., Math Assignment #5"
                      defaultValue={uploadingImage.name.replace(/\.[^/.]+$/, '')}
                    />
                  </div>
                  <Button
                    onClick={handleSolveHomework}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? 'Solving...' : 'Solve Homework'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-8 space-y-6">
              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Homework Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={selectedHomework.imageUrl}
                      alt="Homework question"
                      className="w-full max-h-96 object-contain bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedHomework.solution}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedHomework(null);
                  setUploadingImage(null);
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New Homework
              </Button>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default HomeworkModule;