import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { CreditCard, Zap, Check } from 'lucide-react';

const Subscription = ({ user, onLogout }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planType) => {
    setLoading(true);
    try {
      const response = await axios.post('/subscription/create-order', { plan_type: planType });
      
      // Initialize Razorpay (would need Razorpay key from backend)
      toast.info('Razorpay integration requires API keys. Feature coming soon!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar user={user} onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription Plans</h1>
          <p className="text-lg text-gray-600">Choose the plan that works best for you</p>
        </div>

        <Tabs defaultValue="subscription" className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="credits">Buy Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl">Monthly</CardTitle>
                  <CardDescription>Perfect for short-term needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-6">
                    ₹399<span className="text-lg text-gray-600 font-normal">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Unlimited AI features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>All document types</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Subscribe Monthly
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-600 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    BEST VALUE
                  </span>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">Yearly</CardTitle>
                  <CardDescription>Save ₹788 per year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-6">
                    ₹3,999<span className="text-lg text-gray-600 font-normal">/year</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Everything in Monthly</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>2 months free</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => handleSubscribe('yearly')}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Subscribe Yearly
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="credits">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Purchase Credits</CardTitle>
                <CardDescription>
                  ₹1 per credit. Use credits for AI features without subscription.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="credits">Number of Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="10"
                      defaultValue="50"
                      placeholder="50"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold">₹50</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Purchase Credits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Status */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium capitalize">
                  {user.subscription_plan === 'free' ? 'Free' : user.subscription_plan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  user.subscription_status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {user.subscription_status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Credits:</span>
                <span className="font-medium">{user.credits}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscription;