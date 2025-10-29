import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { BookOpen, Sparkles, TrendingUp, Target } from 'lucide-react';

const Landing = ({ onLogin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Email/Password Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Phone Auth
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpData, setOtpData] = useState(null);

  const studyQuotes = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      text: "AI-powered learning tailored to your age and pace",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      text: "Transform textbooks into smart summaries in seconds",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      text: "Ace your exams with personalized study plans",
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/signup', { email, password, name });
      onLogin(response.data.access_token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/home');
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
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/home`;
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
      navigate('/home');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background" data-testid="landing-page">
      {/* Left Panel - Hero Image & Quotes */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/10 via-purple-500/10 to-orange-500/10 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">StudySage</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Learning</p>
            </div>
          </div>

          {/* Center Content */}
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Master Your Studies with
                <br />
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Intelligent AI
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Transform how you learn with personalized study plans, instant Q&A, and smart summaries.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {studyQuotes.map((quote, idx) => (
                <Card 
                  key={idx} 
                  className="glass-morphism border-none animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${quote.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {quote.icon}
                    </div>
                    <p className="text-sm font-medium">{quote.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="flex gap-8 animate-slide-up">
            <div>
              <div className="text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Free Credits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">₹5</div>
              <div className="text-sm text-muted-foreground">Per Credit</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Study Modes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">StudySage</span>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome</h2>
            <p className="text-muted-foreground">Sign in or create an account to get started</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
              <TabsTrigger value="phone" data-testid="tab-phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email-input"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password-input"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
                data-testid="google-login-btn"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="signup-name-input"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="signup-email-input"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="signup-password-input"
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  data-testid="signup-submit-btn"
                >
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full"
                data-testid="google-signup-btn"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
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
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send you a verification code
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
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
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      data-testid="otp-input"
                      className="mt-1 text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      OTP sent to {otpData?.phone}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
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
        </div>
      </div>
    </div>
  );
};

export default Landing;
