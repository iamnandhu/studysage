import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Brain, FileText, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-8" data-testid="home-page">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center animate-slide-up">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Welcome to StudySage
          </h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered study companion for smarter learning
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="card-hover cursor-pointer" onClick={() => navigate('/sessions?type=exam_prep')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Exam Prep</h3>
              <p className="text-sm text-muted-foreground">
                AI-generated study plans, summaries, and practice materials
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => navigate('/sessions?type=qa')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Q&A Assistant</h3>
              <p className="text-sm text-muted-foreground">
                Get precise answers from your documents with citations
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover cursor-pointer" onClick={() => navigate('/sessions?type=homework')}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Homework Solver</h3>
              <p className="text-sm text-muted-foreground">
                Detailed explanations and summaries for your assignments
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the "New Session" button in the sidebar to create your first study session.
                  Choose a module type, upload your documents, and let AI help you learn smarter!
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• You have 10 free credits to start</li>
                  <li>• Each AI action costs 1 credit (₹5)</li>
                  <li>• Content is personalized based on your age</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;