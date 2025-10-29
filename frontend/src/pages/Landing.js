import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { BookOpen, Brain, FileText, Sparkles, CreditCard, Zap } from 'lucide-react';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Email/Password Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone Auth
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/signup', { email, password, name });
      onLogin(response.data.access_token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', { email, password });
      onLogin(response.data.access_token, response.data.user);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/phone/send-otp', { phone });
      setOtpData(response.data);
      setOtpSent(true);
      toast.success(`OTP sent to ${response.data.phone}. OTP: ${response.data.otp}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/phone/verify-otp', { phone: otpData.phone, otp });
      onLogin(response.data.access_token, response.data.user);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      {!showAuth && (
        <div className="container mx-auto px-4 py-16">
          <nav className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">StudySage</span>
            </div>
            <Button
              onClick={() => setShowAuth(true)}
              data-testid="get-started-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
            >
              Get Started
            </Button>
          </nav>

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 fade-in">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
                Your AI-Powered
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Study Companion
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your learning with AI-powered summaries, flashcards, Q&A,
                and personalized exam preparation
              </p>
              <div className="mt-8 flex gap-4 justify-center">
                <Button
                  onClick={() => setShowAuth(true)}
                  size="lg"
                  data-testid="hero-get-started-btn"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-full text-lg"
                >
                  Start Learning Free
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="card-hover bg-white p-8 rounded-2xl shadow-lg" data-testid="feature-summarize">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Smart Summaries</h3>
                <p className="text-gray-600">
                  Get concise summaries of your textbooks and documents powered by AI
                </p>
              </div>

              <div className="card-hover bg-white p-8 rounded-2xl shadow-lg" data-testid="feature-flashcards">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Flashcards & Mindmaps</h3>
                <p className="text-gray-600">
                  Auto-generate flashcards and visual mindmaps for better retention
                </p>
              </div>

              <div className="card-hover bg-white p-8 rounded-2xl shadow-lg" data-testid="feature-qa">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Homework Help</h3>
                <p className="text-gray-600">
                  Get instant answers to your homework questions with detailed explanations
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-20">
              <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
                  <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                  <div className="text-4xl font-bold mb-4">
                    ₹399<span className="text-lg text-gray-600">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span>Unlimited AI features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-xl border-2 border-blue-600">
                  <div className="text-sm font-semibold mb-2 bg-blue-500 inline-block px-3 py-1 rounded-full">
                    BEST VALUE
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Yearly</h3>
                  <div className="text-4xl font-bold mb-4">
                    ₹3,999<span className="text-lg opacity-80">/year</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span>All monthly features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Save ₹788/year</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
          <Card className="w-full max-w-md" data-testid="auth-card">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold">StudySage</span>
              </div>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in or create an account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="phone" data-testid="tab-phone">Phone</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="login-email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-testid="login-password-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                      data-testid="login-submit-btn"
                    >
                      {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full"
                    data-testid="google-login-btn"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        data-testid="signup-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        data-testid="signup-email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        data-testid="signup-password-input"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                      data-testid="signup-submit-btn"
                    >
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                  </form>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full"
                    data-testid="google-signup-btn"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </TabsContent>

                <TabsContent value="phone">
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          data-testid="phone-input"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                        data-testid="send-otp-btn"
                      >
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input
                          id="otp"
                          type="text"
                          maxLength="6"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          data-testid="otp-input"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          OTP sent to {otpData?.phone}
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={loading}
                        data-testid="verify-otp-btn"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        data-testid="resend-otp-btn"
                      >
                        Resend OTP
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Landing;