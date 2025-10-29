import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const ExamPrep = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar user={user} onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Exam Preparation</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <Construction className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-gray-600">Dedicated exam preparation mode with focused study materials</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExamPrep;