import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { FileText, Sparkles, Brain, GitBranch, ChevronRight, ChevronLeft, Eye } from 'lucide-react';

const StudyMaterials = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/study-materials');
      setMaterials(response.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  const groupedMaterials = {
    summary: materials.filter(m => m.type === 'summary'),
    flashcard: materials.filter(m => m.type === 'flashcard'),
    mindmap: materials.filter(m => m.type === 'mindmap')
  };

  const renderSummary = (material) => (
    <Card className="cursor-pointer card-hover" onClick={() => setSelectedMaterial(material)} data-testid={`summary-${material.id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{material.content.document_name}</CardTitle>
            <CardDescription className="text-xs">
              {new Date(material.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">
          {material.content.summary?.substring(0, 150)}...
        </p>
        <Button variant="link" className="p-0 h-auto mt-2 text-blue-600">
          Read Full Summary
        </Button>
      </CardContent>
    </Card>
  );

  const renderFlashcardSet = (material) => (
    <Card className="cursor-pointer card-hover" onClick={() => setSelectedMaterial(material)} data-testid={`flashcard-${material.id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{material.content.document_name}</CardTitle>
            <CardDescription className="text-xs">
              {material.content.flashcards?.length || 0} flashcards
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          Study Flashcards
        </Button>
      </CardContent>
    </Card>
  );

  const renderMindmap = (material) => (
    <Card className="cursor-pointer card-hover" onClick={() => setSelectedMaterial(material)} data-testid={`mindmap-${material.id}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{material.content.document_name}</CardTitle>
            <CardDescription className="text-xs">
              {new Date(material.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          View Mindmap
        </Button>
      </CardContent>
    </Card>
  );

  const renderMindmapTree = (node, level = 0) => (
    <div key={node.title} className={`${level > 0 ? 'ml-6 mt-2' : ''}`}>
      <div className="flex items-center gap-2">
        {level > 0 && <div className="w-4 h-0.5 bg-gray-300" />}
        <div className={`p-3 rounded-lg ${
          level === 0 ? 'bg-purple-100 font-bold' : 
          level === 1 ? 'bg-purple-50' : 'bg-gray-50'
        }`}>
          {node.title}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-2">
          {node.children.map((child, idx) => renderMindmapTree(child, level + 1))}
        </div>
      )}
    </div>
  );

  const handleNextFlashcard = () => {
    if (selectedMaterial?.content.flashcards) {
      const nextIndex = (currentFlashcard + 1) % selectedMaterial.content.flashcards.length;
      setCurrentFlashcard(nextIndex);
      setShowAnswer(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (selectedMaterial?.content.flashcards) {
      const prevIndex = currentFlashcard === 0 
        ? selectedMaterial.content.flashcards.length - 1 
        : currentFlashcard - 1;
      setCurrentFlashcard(prevIndex);
      setShowAnswer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="study-materials-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="materials-heading">Study Materials</h1>
          <p className="text-gray-600">View and manage your AI-generated study content</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all" data-testid="tab-all">All ({materials.length})</TabsTrigger>
            <TabsTrigger value="summaries" data-testid="tab-summaries">Summaries ({groupedMaterials.summary.length})</TabsTrigger>
            <TabsTrigger value="flashcards" data-testid="tab-flashcards">Flashcards ({groupedMaterials.flashcard.length})</TabsTrigger>
            <TabsTrigger value="mindmaps" data-testid="tab-mindmaps">Mindmaps ({groupedMaterials.mindmap.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <Card key={i} className="skeleton h-48" />)}
              </div>
            ) : materials.length === 0 ? (
              <Card className="p-12 text-center" data-testid="empty-materials">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No study materials yet</h3>
                <p className="text-gray-600 mb-4">Upload documents and generate AI-powered study materials</p>
                <Button onClick={() => navigate('/documents')} className="bg-blue-600 hover:bg-blue-700">
                  Upload Document
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {materials.map((material) => {
                  if (material.type === 'summary') return renderSummary(material);
                  if (material.type === 'flashcard') return renderFlashcardSet(material);
                  if (material.type === 'mindmap') return renderMindmap(material);
                  return null;
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="summaries">
            {groupedMaterials.summary.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No summaries yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {groupedMaterials.summary.map(renderSummary)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="flashcards">
            {groupedMaterials.flashcard.length === 0 ? (
              <Card className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No flashcards yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {groupedMaterials.flashcard.map(renderFlashcardSet)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mindmaps">
            {groupedMaterials.mindmap.length === 0 ? (
              <Card className="p-12 text-center">
                <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No mindmaps yet</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {groupedMaterials.mindmap.map(renderMindmap)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Material Detail Dialog */}
        <Dialog open={!!selectedMaterial} onOpenChange={() => {
          setSelectedMaterial(null);
          setCurrentFlashcard(0);
          setShowAnswer(false);
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="material-dialog">
            {selectedMaterial && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedMaterial.content.document_name}</DialogTitle>
                </DialogHeader>

                {/* Summary View */}
                {selectedMaterial.type === 'summary' && (
                  <div className="prose max-w-none" data-testid="summary-content">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {selectedMaterial.content.summary}
                    </div>
                  </div>
                )}

                {/* Flashcard View */}
                {selectedMaterial.type === 'flashcard' && selectedMaterial.content.flashcards && (
                  <div className="space-y-4" data-testid="flashcard-viewer">
                    <div className="text-center text-sm text-gray-600">
                      Card {currentFlashcard + 1} of {selectedMaterial.content.flashcards.length}
                    </div>

                    <Card className="min-h-[300px] flex items-center justify-center p-8 cursor-pointer" 
                          onClick={() => setShowAnswer(!showAnswer)}
                          data-testid="flashcard-card">
                      <div className="text-center">
                        {!showAnswer ? (
                          <>
                            <p className="text-sm text-gray-500 mb-4">Question</p>
                            <p className="text-xl font-medium">
                              {selectedMaterial.content.flashcards[currentFlashcard].question}
                            </p>
                            <p className="text-sm text-gray-400 mt-8">Click to reveal answer</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-500 mb-4">Answer</p>
                            <p className="text-xl">
                              {selectedMaterial.content.flashcards[currentFlashcard].answer}
                            </p>
                          </>
                        )}
                      </div>
                    </Card>

                    <div className="flex justify-between items-center">
                      <Button
                        onClick={handlePrevFlashcard}
                        variant="outline"
                        disabled={selectedMaterial.content.flashcards.length <= 1}
                        data-testid="prev-flashcard-btn"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      <Button onClick={() => setShowAnswer(!showAnswer)} variant="outline" data-testid="toggle-answer-btn">
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                      </Button>

                      <Button
                        onClick={handleNextFlashcard}
                        variant="outline"
                        disabled={selectedMaterial.content.flashcards.length <= 1}
                        data-testid="next-flashcard-btn"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mindmap View */}
                {selectedMaterial.type === 'mindmap' && selectedMaterial.content.mindmap && (
                  <div className="p-4" data-testid="mindmap-content">
                    {renderMindmapTree(selectedMaterial.content.mindmap)}
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudyMaterials;