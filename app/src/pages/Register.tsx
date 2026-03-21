import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Loader2, Eye, EyeOff, CheckCircle, ArrowRight, User, Building2 } from 'lucide-react';

export default function Register() {
  const [activeTab, setActiveTab] = useState('brand');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: activeTab === 'brand' ? 'user' : 'influencer',
        phone: formData.phone,
        company: formData.company
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
        <div className="absolute inset-0 bg-radial-glow" />
        <Card className="w-full max-w-md glass-card border-white/[0.06] rounded-3xl relative z-10">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6 btn-glow">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Welcome to Yugo2Market!</h2>
            <p className="text-white/50">Your account has been created successfully. Redirecting...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-creator-purple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-creator-blue/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center btn-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-white">
              Yugo<span className="gradient-text">2</span>Market
            </span>
          </Link>
        </div>

        <Card className="glass-card border-white/[0.06] rounded-3xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-black text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-white/50 text-base">
              Join the #1 Local Influencer Network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-2 glass p-1 rounded-xl">
                <TabsTrigger value="brand" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  I&apos;m a Brand
                </TabsTrigger>
                <TabsTrigger value="influencer" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  I&apos;m a Creator
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30 rounded-2xl">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/70">Full Name</Label>
                <Input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>

              {activeTab === 'brand' && (
                <div className="space-y-2">
                  <Label className="text-white/70">Company Name (Optional)</Label>
                  <Input
                    name="company"
                    type="text"
                    placeholder="Your Company"
                    value={formData.company}
                    onChange={handleChange}
                    className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70">Phone Number (Optional)</Label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="+91 123 456 7890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Password</Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/70">Confirm Password</Label>
                <Input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-creator-pink focus:ring-creator-pink/20"
                />
                <Label htmlFor="terms" className="ml-2 text-sm text-white/50">
                  I agree to the{' '}
                  <Link to="/terms" className="text-creator-pink hover:text-creator-purple">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-creator-pink hover:text-creator-purple">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-bg text-white border-0 rounded-xl py-6 text-lg font-semibold btn-glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/50">
                Already have an account?{' '}
                <Link to="/login" className="text-creator-pink hover:text-creator-purple font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
