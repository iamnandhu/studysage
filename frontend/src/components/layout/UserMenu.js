import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import axios from 'axios';
import { toast } from 'sonner';
import { User, Settings, FileText, CreditCard, LogOut, Coins } from 'lucide-react';

const UserMenu = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [age, setAge] = useState(user?.age || '');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);

  useEffect(() => {
    // Fetch payment config
    const fetchPaymentConfig = async () => {
      try {
        const response = await axios.get('/payments/config');
        setPaymentConfig(response.data);
      } catch (error) {
        console.error('Error fetching payment config:', error);
      }
    };
    fetchPaymentConfig();
  }, []);

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleUpdateAge = async () => {
    if (!age || age < 1 || age > 120) {
      toast.error('Please enter a valid age');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/user/age', { age: parseInt(age) });
      toast.success('Age updated successfully');
      if (onUserUpdate) {
        const response = await axios.get('/auth/me');
        onUserUpdate(response.data);
      }
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating age:', error);
      toast.error('Failed to update age');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (credits, amount) => {
    if (!paymentConfig) {
      toast.error('Payment system not available');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderResponse = await axios.post('/payments/create-credit-order', {
        credits,
        amount
      });

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: paymentConfig.key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'StudySage',
          description: `Purchase ${credits} Credits`,
          order_id: orderResponse.data.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verifyResponse = await axios.post('/payments/verify-credit-payment', {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });

              toast.success(`${verifyResponse.data.credits_added} credits added!`);
              
              // Refresh user data
              if (onUserUpdate) {
                const userResponse = await axios.get('/auth/me');
                onUserUpdate(userResponse.data);
              }
              
              setShowCredits(false);
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email
          },
          theme: {
            color: '#3b82f6'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if (!paymentConfig) {
      toast.error('Payment system not available');
      return;
    }

    setLoading(true);
    try {
      // Create subscription order
      const orderResponse = await axios.post('/payments/create-subscription-order', {
        plan
      });

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: paymentConfig.key_id,
          amount: orderResponse.data.amount,
          currency: orderResponse.data.currency,
          name: 'StudySage',
          description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
          order_id: orderResponse.data.id,
          handler: async (response) => {
            try {
              // Verify and activate subscription
              const verifyResponse = await axios.post('/payments/verify-subscription-payment', {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });

              toast.success('Subscription activated!');
              
              // Refresh user data
              if (onUserUpdate) {
                const userResponse = await axios.get('/auth/me');
                onUserUpdate(userResponse.data);
              }
              
              setShowCredits(false);
            } catch (error) {
              toast.error('Subscription activation failed');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email
          },
          theme: {
            color: '#3b82f6'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Error creating subscription order:', error);
      toast.error('Failed to initiate subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full"
            data-testid="user-menu-trigger"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Coins className="w-3 h-3" />
              <span>{user?.credits || 0} credits</span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            fetchDocuments();
            setShowUploads(true);
          }}>
            <FileText className="mr-2 h-4 w-4" />
            <span>My Uploads</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCredits(true)}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Buy Credits</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-red-500">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
              <p className="text-xs text-muted-foreground">
                AI responses are tailored to your age
              </p>
            </div>
            <Button
              onClick={handleUpdateAge}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Age'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Uploads Dialog */}
      <Dialog open={showUploads} onOpenChange={setShowUploads}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>My Uploads</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.filename}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{((doc.file_size || 0) / 1024).toFixed(1)} KB</span>
                            {doc.page_count && <span>• {doc.page_count} pages</span>}
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              doc.is_global ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {doc.is_global ? 'Global' : doc.session_name || 'Session'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Buy Credits Dialog */}
      <Dialog open={showCredits} onOpenChange={setShowCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Current Balance</h3>
                  <p className="text-3xl font-bold text-primary mb-4">{user?.credits || 0} credits</p>
                  <p className="text-sm text-muted-foreground">1 credit = ₹5</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleBuyCredits(10, 50)}
                disabled={loading}
              >
                <span>10 Credits</span>
                <span className="font-bold">₹50</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleBuyCredits(50, 250)}
                disabled={loading}
              >
                <span>50 Credits</span>
                <span className="font-bold">₹250</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleBuyCredits(100, 500)}
                disabled={loading}
              >
                <span>100 Credits</span>
                <span className="font-bold">₹500</span>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2">Monthly Subscription</h4>
              <Button
                className="w-full justify-between"
                onClick={() => handleSubscribe('monthly')}
                disabled={loading}
              >
                <span>₹399/month</span>
                <span>Unlimited Usage</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Cancel anytime, no commitment
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserMenu;
