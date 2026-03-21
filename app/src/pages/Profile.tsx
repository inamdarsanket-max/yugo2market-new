import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Loader2, 
  Camera,
  Lock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || ''
      });
      if (user.role === 'influencer') {
        fetchInfluencerProfile();
      }
    }
  }, [user]);

  const fetchInfluencerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/influencers/me/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.influencer);
    } catch (error) {
      console.error('Error fetching influencer profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser(response.data.user);
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/auth/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
          <TrendingUp className="w-4 h-4 text-creator-pink" />
          <span className="text-sm text-white/70">Profile</span>
        </div>
        <h1 className="text-4xl font-black text-white">Your Profile</h1>
        <p className="text-white/50 mt-2">Manage your account settings</p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass p-1 rounded-xl">
          <TabsTrigger value="general" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">General</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Security</TabsTrigger>
          {user?.role === 'influencer' && (
            <TabsTrigger value="influencer" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Creator Profile</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="glass-card border-white/[0.06] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center avatar-glow">
                      <span className="text-3xl font-black text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Camera className="w-5 h-5 text-white/70" />
                    </button>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Profile Picture</p>
                    <p className="text-sm text-white/50">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-white/70">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91 123 456 7890"
                        className="pl-12 py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/70">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Your Company"
                        className="pl-12 py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Badge className="bg-white/10 text-white capitalize px-4 py-2 rounded-full">
                    {user?.role}
                  </Badge>
                  {user?.isVerified && (
                    <Badge className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <Button type="submit" className="gradient-bg text-white rounded-xl px-8 py-6 btn-glow" disabled={saving}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card border-white/[0.06] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label className="text-white/70">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/70">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="gradient-bg text-white rounded-xl px-8 py-6 btn-glow" disabled={saving}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {user?.role === 'influencer' && (
          <TabsContent value="influencer" className="space-y-6">
            <Card className="glass-card border-white/[0.06] rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Creator Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-white/50 mb-2">Bio</p>
                      <p className="text-white text-lg">{profile.bio || 'No bio added'}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-3">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.categories?.map((cat: string, idx: number) => (
                          <Badge key={idx} className="bg-white/10 text-white border-white/10 px-4 py-2 rounded-full">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 text-center min-w-[120px]">
                        <p className="text-3xl font-black gradient-text">{profile.rating}</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider">Rating</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 text-center min-w-[120px]">
                        <p className="text-3xl font-black text-white">{profile.totalCampaigns}</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider">Campaigns</p>
                      </div>
                    </div>
                    <Button className="gradient-bg text-white rounded-xl px-8 py-6 btn-glow">
                      Edit Creator Profile
                    </Button>
                  </div>
                ) : (
                  <p className="text-white/50">Loading creator profile...</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
