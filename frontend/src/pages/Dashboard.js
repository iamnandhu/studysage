import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';
import axios from 'axios';
import { FileText, Brain, BookOpen, Sparkles, Upload, CreditCard, TrendingUp } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    documents: 0,
    studyMaterials: 0,
    credits: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [docsResponse, materialsResponse, userResponse] = await Promise.all([
        axios.get('/documents'),
        axios.get('/study-materials'),
        axios.get('/auth/me')
      ]);

      setStats({
        documents: docsResponse.data.length,
        studyMaterials: materialsResponse.data.length,
        credits: userResponse.data.credits
      });

      setRecentDocuments(docsResponse.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" data-testid="dashboard-page">
      <Navbar user={user} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" data-testid="welcome-heading">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-gray-600">Ready to enhance your learning today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover" data-testid="stat-card-documents">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Documents</CardTitle>
              <FileText className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.documents}</div>
              <p className="text-xs text-gray-600 mt-1">Total uploaded</p>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-card-materials">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Study Materials</CardTitle>
              <Sparkles className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.studyMaterials}</div>
              <p className="text-xs text-gray-600 mt-1">AI-generated</p>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="stat-card-credits">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Credits</CardTitle>
              <CreditCard className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.credits}</div>
              <Button
                variant="link"
                className="text-xs p-0 h-auto mt-1 text-blue-600"
                onClick={() => navigate('/subscription')}
                data-testid="buy-credits-btn"
              >
                Buy more credits
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/documents')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              data-testid="action-upload-btn"
            >
              <Upload className="w-6 h-6" />
              <span>Upload Document</span>
            </Button>

            <Button
              onClick={() => navigate('/qa')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              data-testid="action-qa-btn"
            >
              <Brain className="w-6 h-6" />
              <span>Ask Question</span>
            </Button>

            <Button
              onClick={() => navigate('/study-materials')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
              data-testid="action-materials-btn"
            >
              <Sparkles className="w-6 h-6" />
              <span>Study Materials</span>
            </Button>

            <Button
              onClick={() => navigate('/exam-prep')}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
              data-testid="action-exam-btn"
            >
              <TrendingUp className="w-6 h-6" />
              <span>Exam Prep</span>
            </Button>
          </div>
        </div>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recent Documents</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/documents')}
                data-testid="view-all-docs-btn"
              >
                View All
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {recentDocuments.map((doc) => (
                <Card key={doc.id} className="card-hover" data-testid={`recent-doc-${doc.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">{doc.filename}</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/reading/${doc.id}`)}
                      data-testid={`view-doc-${doc.id}`}
                    >
                      View Document
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Banner */}
        {user.subscription_status !== 'active' && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-green-600 text-white border-0" data-testid="subscription-banner">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
                  <p className="text-blue-100">
                    Get unlimited AI features and priority support starting at ₹399/month
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/subscription')}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  data-testid="upgrade-premium-btn"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;