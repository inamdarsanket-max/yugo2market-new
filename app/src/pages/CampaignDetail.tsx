import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Loader2, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar
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

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaign(response.data.campaign);
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/campaigns/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaign();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-creator-pink" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black text-white mb-4">Campaign Not Found</h2>
        <Button onClick={() => navigate('/dashboard/campaigns')} className="gradient-bg text-white rounded-full px-8 btn-glow">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  const isBrand = user?.role === 'user';
  const isInfluencer = user?.role === 'influencer';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/campaigns')} className="text-white/60 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 p-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Campaign Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-black text-white">{campaign.title}</h1>
            <Badge className={`${statusColors[campaign.status]} border-0 rounded-full px-4 py-1.5 text-sm`}>
              {campaign.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-white/50 text-lg max-w-2xl">{campaign.description}</p>
        </div>
        <div className="flex gap-3">
          {campaign.status === 'pending' && isInfluencer && (
            <>
              <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full px-6" onClick={() => updateStatus('cancelled')}>
                <XCircle className="w-4 h-4 mr-2" />
                Decline
              </Button>
              <Button className="gradient-bg text-white rounded-full px-6 btn-glow" onClick={() => updateStatus('active')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </Button>
            </>
          )}
          {campaign.status === 'active' && (
            <Button className="gradient-bg text-white rounded-full px-6 btn-glow" onClick={() => updateStatus('in_progress')}>
              <Clock className="w-4 h-4 mr-2" />
              Mark In Progress
            </Button>
          )}
          {campaign.status === 'in_progress' && (
            <Button className="gradient-bg text-white rounded-full px-6 btn-glow" onClick={() => updateStatus('completed')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="glass p-1 rounded-xl">
              <TabsTrigger value="details" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Details</TabsTrigger>
              <TabsTrigger value="deliverables" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Deliverables</TabsTrigger>
              <TabsTrigger value="milestones" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="glass-card border-white/[0.06] rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Campaign Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white/5 rounded-2xl p-5">
                      <p className="text-white/50 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-creator-pink" /> Budget
                      </p>
                      <p className="text-3xl font-black text-white">₹{campaign.budget.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5">
                      <p className="text-white/50 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-creator-purple" /> Duration
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-4">
              {campaign.deliverables?.length > 0 ? (
                campaign.deliverables.map((deliverable: any, idx: number) => (
                  <Card key={idx} className="glass-card border-white/[0.06] rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-lg capitalize">{deliverable.type}</p>
                          <p className="text-white/50">Quantity: {deliverable.quantity}</p>
                        </div>
                        <Badge className={`${statusColors[deliverable.status]} border-0 rounded-full`}>
                          {deliverable.status}
                        </Badge>
                      </div>
                      {deliverable.requirements && (
                        <p className="text-white/50 mt-3">{deliverable.requirements}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="glass-card border-white/[0.06] rounded-2xl">
                  <CardContent className="p-10 text-center">
                    <p className="text-white/50">No deliverables defined yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              {campaign.milestones?.length > 0 ? (
                campaign.milestones.map((milestone: any, idx: number) => (
                  <Card key={idx} className="glass-card border-white/[0.06] rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-lg">{milestone.title}</p>
                          <p className="text-white/50">{milestone.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white text-xl">₹{milestone.amount.toLocaleString()}</p>
                          <Badge className={`${statusColors[milestone.status]} border-0 rounded-full mt-1`}>
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="glass-card border-white/[0.06] rounded-2xl">
                  <CardContent className="p-10 text-center">
                    <p className="text-white/50">No milestones defined yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Brand/Influencer Info */}
          <Card className="glass-card border-white/[0.06] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">
                {isBrand ? 'Creator' : 'Brand'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {isBrand 
                      ? campaign.influencer?.user?.name?.charAt(0).toUpperCase()
                      : campaign.brand?.name?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <div>
                  <p className="font-bold text-white text-lg">
                    {isBrand ? campaign.influencer?.user?.name : campaign.brand?.name}
                  </p>
                  <p className="text-white/50">
                    {isBrand ? campaign.influencer?.user?.email : campaign.brand?.email}
                  </p>
                </div>
              </div>
              <Button className="w-full mt-5 gradient-bg text-white rounded-xl btn-glow">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Campaign Stats */}
          <Card className="glass-card border-white/[0.06] rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-creator-pink" />
                Campaign Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Reach', value: campaign.metrics?.reach || 0 },
                { label: 'Impressions', value: campaign.metrics?.impressions || 0 },
                { label: 'Engagement', value: campaign.metrics?.engagement || 0 },
                { label: 'Clicks', value: campaign.metrics?.clicks || 0 }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-white/50">{stat.label}</span>
                  <span className="text-white font-bold">{stat.value.toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
