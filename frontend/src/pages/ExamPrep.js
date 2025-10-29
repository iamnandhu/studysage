import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { toast } from 'sonner';
import { Target, TrendingUp, CheckCircle2, BookOpen, Sparkles, FileText, Brain } from 'lucide-react';

const ExamPrep = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [examDocs, setExamDocs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studyProgress, setStudyProgress] = useState({});

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const [docsResponse, materialsResponse] = await Promise.all([
        axios.get('/documents', { params: { is_exam_prep: true } }),
        axios.get('/study-materials')
      ]);

      setExamDocs(docsResponse.data);
      setMaterials(materialsResponse.data);
      
      // Load study progress from localStorage
      const savedProgress = localStorage.getItem('exam_study_progress');
      if (savedProgress) {
        setStudyProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Failed to load exam preparation data');
    } finally {
      setLoading(false);
    }
  };

  const toggleProgress = (materialId) => {
    const newProgress = {
      ...studyProgress,
      [materialId]: !studyProgress[materialId]
    };
    setStudyProgress(newProgress);
    localStorage.setItem('exam_study_progress', JSON.stringify(newProgress));
  };

  const getExamMaterials = () => {
    return materials.filter(m => 
      examDocs.some(doc => doc.id === m.document_id)
    );
  };

  const examMaterials = getExamMaterials();
  const completedCount = Object.values(studyProgress).filter(Boolean).length;
  const totalCount = examMaterials.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const groupByType = (materials) => {
    return {
      summaries: materials.filter(m => m.type === 'summary'),
      flashcards: materials.filter(m => m.type === 'flashcard'),
      mindmaps: materials.filter(m => m.type === 'mindmap')
    };
  };

  const grouped = groupByType(examMaterials);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50" data-testid="exam-prep-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900" data-testid="exam-prep-heading">Exam Preparation</h1>
          </div>
          <p className="text-gray-600">Focused study materials curated for your exam</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8" data-testid="progress-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Study Progress</CardTitle>
                <CardDescription>Track your exam preparation journey</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(progressPercentage)}%
                </div>
                <p className="text-sm text-gray-600">
                  {completedCount} of {totalCount} completed
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{examDocs.length}</p>
                  <p className="text-xs text-gray-600">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grouped.summaries.length}</p>
                  <p className="text-xs text-gray-600">Summaries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grouped.flashcards.length}</p>
                  <p className="text-xs text-gray-600">Flashcard Sets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{grouped.mindmaps.length}</p>
                  <p className="text-xs text-gray-600">Mindmaps</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Materials */}
        {loading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exam materials...</p>
          </Card>
        ) : examMaterials.length === 0 ? (
          <Card className="p-12 text-center" data-testid="empty-exam-prep">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Exam Materials Yet</h3>
            <p className="text-gray-600 mb-4">
              Upload documents and generate study materials for your exam preparation
            </p>
            <Button
              onClick={() => navigate('/documents')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Upload Exam Documents
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all" data-testid="tab-all">All Materials</TabsTrigger>
              <TabsTrigger value="summaries" data-testid="tab-summaries">Summaries</TabsTrigger>
              <TabsTrigger value="flashcards" data-testid="tab-flashcards">Flashcards</TabsTrigger>
              <TabsTrigger value="mindmaps" data-testid="tab-mindmaps">Mindmaps</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="space-y-3">
                {examMaterials.map((material) => (
                  <Card key={material.id} className="card-hover" data-testid={`material-${material.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={studyProgress[material.id] || false}
                          onCheckedChange={() => toggleProgress(material.id)}
                          data-testid={`checkbox-${material.id}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{material.content.document_name}</p>
                          <p className="text-sm text-gray-600 capitalize">{material.type}</p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate('/study-materials')}
                          data-testid={`view-material-${material.id}`}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="summaries">
              {grouped.summaries.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600">No summaries available</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grouped.summaries.map((material) => (
                    <Card key={material.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={studyProgress[material.id] || false}
                            onCheckedChange={() => toggleProgress(material.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{material.content.document_name}</p>
                          </div>
                          <Button variant="outline" onClick={() => navigate('/study-materials')}>
                            View Summary
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="flashcards">
              {grouped.flashcards.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600">No flashcards available</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grouped.flashcards.map((material) => (
                    <Card key={material.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={studyProgress[material.id] || false}
                            onCheckedChange={() => toggleProgress(material.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{material.content.document_name}</p>
                            <p className="text-sm text-gray-600">
                              {material.content.flashcards?.length || 0} cards
                            </p>
                          </div>
                          <Button variant="outline" onClick={() => navigate('/study-materials')}>
                            Study
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mindmaps">
              {grouped.mindmaps.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-600">No mindmaps available</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grouped.mindmaps.map((material) => (
                    <Card key={material.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={studyProgress[material.id] || false}
                            onCheckedChange={() => toggleProgress(material.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{material.content.document_name}</p>
                          </div>
                          <Button variant="outline" onClick={() => navigate('/study-materials')}>
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Quick Actions */}
        {examDocs.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Need More Study Materials?</h3>
                  <p className="text-orange-100">
                    Generate flashcards, summaries, and mindmaps from your exam documents
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/documents')}
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  View Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExamPrep;