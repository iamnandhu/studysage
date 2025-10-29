import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import ExamPrepModule from '@/components/modules/ExamPrepModule';
import QAModule from '@/components/modules/QAModule';
import HomeworkModule from '@/components/modules/HomeworkModule';

const SessionView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      console.error('Error fetching session:', error);
      toast.error('Session not found');
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex-1 overflow-hidden" data-testid="session-view">
      {session.type === 'exam_prep' && <ExamPrepModule session={session} onUpdate={fetchSession} />}
      {session.type === 'qa' && <QAModule session={session} onUpdate={fetchSession} />}
      {session.type === 'homework' && <HomeworkModule session={session} onUpdate={fetchSession} />}
    </div>
  );
};

export default SessionView;