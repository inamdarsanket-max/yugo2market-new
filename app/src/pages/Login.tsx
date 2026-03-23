import { useAuth } from "../contexts/AuthContext";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-creator-pink/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-creator-purple/10 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
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
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-3xl font-black text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/50 text-base">
              Sign in to continue your creator journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30 rounded-2xl">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-creator-pink focus:ring-creator-pink/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl pr-12 focus:border-creator-pink focus:ring-creator-pink/20"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-creator-pink focus:ring-creator-pink/20"
                  />
                  <Label htmlFor="remember" className="ml-2 text-sm text-white/50">
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-creator-pink hover:text-creator-purple transition-colors">
                  Forgot password?
                </Link>
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
                    Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/50">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-creator-pink hover:text-creator-purple font-semibold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}
