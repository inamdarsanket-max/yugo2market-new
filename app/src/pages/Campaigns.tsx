import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Loader2,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
  draft: 'bg-white/10 text-white/60',
  pending: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-creator-blue/20 text-creator-blue',
  completed: 'bg-creator-purple/20 text-creator-purple',
  cancelled: 'bg-red-500/20 text-red-400'
};

export default function Campaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    influencerId: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data.campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/campaigns`, {
        ...createForm,
        budget: parseFloat(createForm.budget)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateDialog(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'active':
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const filterCampaigns = (status: string) => {
    if (status === 'all') return campaigns;
    return campaigns.filter((c: any) => c.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-creator-pink" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
            <TrendingUp className="w-4 h-4 text-creator-pink" />
            <span className="text-sm text-white/70">Campaigns</span>
          </div>
          <h1 className="text-4xl font-black text-white">Your Campaigns</h1>
          <p className="text-white/50 mt-2">Manage your influencer marketing campaigns</p>
        </div>
        {user?.role === 'user' && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white rounded-full px-6 btn-glow">
                <Plus className="w-5 h-5 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/[0.06] max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">Create New Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCampaign} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Campaign Title</Label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summer Collection Launch"
                    className="glass-strong border-white/10 text-white rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Description</Label>
                  <Textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign goals and requirements..."
                    className="glass-strong border-white/10 text-white rounded-xl min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Budget (₹)</Label>
                  <Input
                    type="number"
                    value={createForm.budget}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="50000"
                    className="glass-strong border-white/10 text-white rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Start Date</Label>
                    <Input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="glass-strong border-white/10 text-white rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">End Date</Label>
                    <Input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="glass-strong border-white/10 text-white rounded-xl"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-bg text-white rounded-xl py-6 btn-glow">
                  Create Campaign
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: campaigns.length, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Active', value: campaigns.filter((c: any) => ['active', 'in_progress'].includes(c.status)).length, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Pending', value: campaigns.filter((c: any) => c.status === 'pending').length, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Completed', value: campaigns.filter((c: any) => c.status === 'completed').length, color: 'text-creator-purple', bg: 'bg-creator-purple/10' }
        ].map((stat, index) => (
          <Card key={index} className={`${stat.bg} border-0 rounded-2xl`}>
            <CardContent className="p-5">
              <p className="text-sm text-white/50 mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campaigns List */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="glass p-1 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">All</TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Active</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Pending</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Completed</TabsTrigger>
        </TabsList>

        {['all', 'active', 'pending', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filterCampaigns(tab).length > 0 ? (
              filterCampaigns(tab).map((campaign: any) => (
                <Link key={campaign._id} to={`/dashboard/campaigns/${campaign._id}`}>
                  <Card className="glass-card border-white/[0.06] rounded-2xl card-glow group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-creator-pink transition-colors">{campaign.title}</h3>
                            <Badge className={`${statusColors[campaign.status]} border-0 rounded-full`}>
                              {getStatusIcon(campaign.status)}
                              <span className="ml-1.5 capitalize">{campaign.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-white/50 text-sm mb-4 line-clamp-2">
                            {campaign.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-5 text-sm">
                            <span className="flex items-center gap-2 text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                              <DollarSign className="w-4 h-4 text-creator-pink" />
                              <span className="text-white font-semibold">₹{campaign.budget.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center gap-2 text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                              <Calendar className="w-4 h-4 text-creator-purple" />
                              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2 text-white/60 bg-white/5 px-3 py-1.5 rounded-full">
                              <Briefcase className="w-4 h-4 text-creator-blue" />
                              {user?.role === 'user' 
                                ? (campaign.influencer?.user?.name || 'Not assigned')
                                : (campaign.brand?.name || 'Unknown brand')
                              }
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-6 h-6 text-white/30 group-hover:text-creator-pink group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="glass-card border-white/[0.06] rounded-2xl">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-white/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No campaigns found</h3>
                  <p className="text-white/50">
                    {tab === 'all' ? 'Get started by creating your first campaign' : `No ${tab} campaigns yet`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
