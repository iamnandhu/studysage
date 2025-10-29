import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const AgeOnboarding = ({ open, onComplete }) => {
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!age || age < 5 || age > 100) {
      toast.error('Please enter a valid age');
      return;
    }

    setLoading(true);
    try {
      await axios.patch('/auth/me', { age: parseInt(age) });
      toast.success('Profile updated!');
      onComplete();
    } catch (error) {
      console.error('Error updating age:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-morphism" data-testid="age-onboarding">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Welcome to StudySage!</DialogTitle>
          <DialogDescription className="text-center">
            Help us personalize your learning experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="age">Your Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="Enter your age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="5"
              max="100"
              data-testid="age-input"
            />
            <p className="text-xs text-muted-foreground mt-2">
              We'll customize content difficulty and explanations based on your age
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
            data-testid="submit-age-btn"
          >
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeOnboarding;