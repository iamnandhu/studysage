import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/ThemeContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight, Sun, Moon, LogOut, BookOpen, MoreVertical, Target, Brain, FileText, Trash2 } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionType, setNewSessionType] = useState('');
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleCreateSession = async (type) => {
    setNewSessionType(type);
    setShowNewSession(true);
  };

  const submitNewSession = async () => {
    if (!newSessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    try {
      const response = await axios.post('/sessions', {
        type: newSessionType,
        name: newSessionName,
        config: {}
      });
      
      setSessions([response.data, ...sessions]);
      setShowNewSession(false);
      setNewSessionName('');
      toast.success('Session created!');
      
      // Navigate to the session
      navigate(`/session/${response.data.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session? All messages will be lost.')) return;

    try {
      await axios.delete(`/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.success('Session deleted');
      
      if (location.pathname.includes(sessionId)) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const getModuleIcon = (type) => {
    switch(type) {
      case 'exam_prep': return <Target className="w-4 h-4" />;
      case 'qa': return <Brain className="w-4 h-4" />;
      case 'homework': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getModuleColor = (type) => {
    switch(type) {
      case 'exam_prep': return 'text-orange-500';
      case 'qa': return 'text-green-500';
      case 'homework': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      <div className={`fixed left-0 top-0 h-full bg-background border-r border-border transition-all duration-300 z-50 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-72'
      }`} data-testid="sidebar">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">StudySage</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            data-testid="collapse-btn"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* New Session Button */}
        <div className="p-4">
          <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
            <DialogTrigger asChild>
              <Button
                className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
                data-testid="new-session-btn"
              >
                <Plus className="w-4 h-4" />
                {!isCollapsed && <span>New Session</span>}
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism" data-testid="new-session-modal">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>Choose a module type and name your session</DialogDescription>
              </DialogHeader>

              {!newSessionType ? (
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-500/10"
                    onClick={() => handleCreateSession('exam_prep')}
                    data-testid="type-exam-prep"
                  >
                    <Target className="w-8 h-8 text-orange-500" />
                    <div>
                      <div className="font-semibold">Exam Prep</div>
                      <div className="text-xs text-muted-foreground">Study plans & materials</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:bg-green-500/10"
                    onClick={() => handleCreateSession('qa')}
                    data-testid="type-qa"
                  >
                    <Brain className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="font-semibold">Q&A Assistant</div>
                      <div className="text-xs text-muted-foreground">Document-based Q&A</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-500/10"
                    onClick={() => handleCreateSession('homework')}
                    data-testid="type-homework"
                  >
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="font-semibold">Homework Solver</div>
                      <div className="text-xs text-muted-foreground">Detailed summaries</div>
                    </div>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                    <div className={getModuleColor(newSessionType)}>
                      {getModuleIcon(newSessionType)}
                    </div>
                    <span className="font-medium capitalize">{newSessionType.replace('_', ' ')}</span>
                  </div>

                  <div>
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      placeholder="e.g., Physics Final Exam"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && submitNewSession()}
                      data-testid="session-name-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setNewSessionType('')} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={submitNewSession} className="flex-1" data-testid="create-session-btn">
                      Create
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 py-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                  location.pathname.includes(session.id) ? 'bg-muted' : ''
                }`}
                onClick={() => navigate(`/session/${session.id}`)}
                data-testid={`session-${session.id}`}
              >
                <div className={getModuleColor(session.type)}>
                  {getModuleIcon(session.type)}
                </div>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate text-sm">{session.name}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleDeleteSession(session.id, e)}>
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))}

            {sessions.length === 0 && !isCollapsed && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No sessions yet. Create one to get started!
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Section */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={toggleTheme}
            data-testid="theme-toggle"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
          </Button>

          {!isCollapsed && (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <div className="font-medium">{user.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span>Credits: {user.credits}</span>
                <span className="text-[10px]">(₹5 each)</span>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={onLogout}
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>

      {/* Spacer */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-72'}`} />
    </>
  );
};

export default Sidebar;