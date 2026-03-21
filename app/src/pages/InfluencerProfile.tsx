import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  MapPin, 
  Instagram, 
  Youtube, 
  Twitter, 
  Globe,
  MessageCircle,
  Briefcase,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Heart
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InfluencerProfile() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencer();
  }, [id]);

  const fetchInfluencer = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/influencers/${id}`);
      setInfluencer(response.data.influencer);
    } catch (error) {
      console.error('Error fetching influencer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/dashboard/campaigns', { state: { hireInfluencer: influencer } });
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-6 h-6" />;
      case 'youtube': return <Youtube className="w-6 h-6" />;
      case 'twitter': return <Twitter className="w-6 h-6" />;
      default: return <Globe className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-creator-pink" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">Creator Not Found</h2>
          <Link to="/marketplace">
            <Button className="gradient-bg text-white rounded-full px-8 btn-glow">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Back Button */}
        <Link to="/marketplace" className="inline-flex items-center text-white/50 hover:text-white mb-8 transition-colors group">
          <div className="w-10 h-10 rounded-full glass flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          Back to Marketplace
        </Link>

        {/* Profile Header - Premium */}
        <div className="relative mb-10">
          {/* Cover */}
          <div className="h-56 md:h-72 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-creator-pink/30 via-creator-purple/30 to-creator-blue/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
            {/* Animated Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-creator-pink/20 rounded-full blur-[100px] animate-pulse-glow" />
          </div>

          {/* Profile Info */}
          <div className="relative -mt-24 md:-mt-28 px-4 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar - Glowing Ring */}
              <div className="relative">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-[#0a0a0f] relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-creator-pink via-creator-purple to-creator-blue rounded-3xl blur-md opacity-80" />
                  <img
                    src={influencer.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.user?.name}`}
                    alt={influencer.user?.name}
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>
                {influencer.isFeatured && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold border-0 px-3 py-1">
                      <Star className="w-3 h-3 mr-1 fill-black" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-4xl md:text-5xl font-black text-white">{influencer.user?.name}</h1>
                  {influencer.isVerified && (
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-white/60 text-lg mb-4">
                  {influencer.categories?.join(' • ') || 'Creator'}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  {influencer.location?.city && (
                    <span className="flex items-center gap-2 text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
                      <MapPin className="w-4 h-4" />
                      {influencer.location.city}, {influencer.location.country}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">{influencer.rating || '0'}</span>
                    <span>({influencer.totalReviews || 0} reviews)</span>
                  </span>
                  <span className="flex items-center gap-2 text-white/50 bg-white/5 px-3 py-1.5 rounded-full">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-white font-semibold">{influencer.totalCampaigns || 0}</span>
                    <span>campaigns</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pb-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-6">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button className="gradient-bg text-white rounded-full px-8 btn-glow" onClick={handleHire}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  Hire Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs - Glass */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="glass p-1 rounded-2xl">
            <TabsTrigger value="overview" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl px-6 py-2.5">
              Overview
            </TabsTrigger>
            <TabsTrigger value="social" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl px-6 py-2.5">
              Social Media
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl px-6 py-2.5">
              Pricing
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-xl px-6 py-2.5">
              Portfolio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bio */}
              <Card className="md:col-span-2 glass-card border-white/[0.06] rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60 text-lg leading-relaxed">
                    {influencer.bio || 'No bio available yet.'}
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass-card border-white/[0.06] rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-2">
                      <Star className="w-4 h-4" /> Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white font-bold text-lg">{influencer.rating || '0'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Campaigns
                    </span>
                    <span className="text-white font-bold text-lg">{influencer.totalCampaigns || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Reviews
                    </span>
                    <span className="text-white font-bold text-lg">{influencer.totalReviews || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Availability</span>
                    <Badge className={influencer.isAvailable ? 'bg-green-500/20 text-green-400 border-0' : 'bg-red-500/20 text-red-400 border-0'}>
                      {influencer.isAvailable ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Languages */}
            {influencer.languages?.length > 0 && (
              <Card className="glass-card border-white/[0.06] rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {influencer.languages.map((lang: string, idx: number) => (
                      <Badge key={idx} className="bg-white/5 text-white border-white/10 px-4 py-2 rounded-full">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencer.socialMedia?.map((social: any, idx: number) => (
                <Card key={idx} className="glass-card border-white/[0.06] rounded-3xl card-glow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
                        {getSocialIcon(social.platform)}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg capitalize">{social.platform}</h3>
                        <p className="text-white/50">@{social.handle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white/5 rounded-2xl p-3">
                        <p className="text-2xl font-black gradient-text">{formatFollowers(social.followers)}</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider">Followers</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3">
                        <p className="text-2xl font-black text-white">{social.engagementRate}%</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider">Engagement</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3">
                        <p className="text-2xl font-black text-white">{(social.avgLikes / 1000).toFixed(1)}K</p>
                        <p className="text-xs text-white/50 uppercase tracking-wider">Avg Likes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencer.pricing?.map((price: any, idx: number) => (
                <Card key={idx} className="glass-card border-white/[0.06] rounded-3xl card-glow group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg capitalize">{price.postType}</h3>
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                    <p className="text-4xl font-black gradient-text mb-2">
                      ₹{price.price.toLocaleString()}
                    </p>
                    <p className="text-white/50 text-sm">per {price.postType}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {influencer.portfolio?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {influencer.portfolio.map((item: any, idx: number) => (
                  <Card key={idx} className="glass-card border-white/[0.06] rounded-3xl overflow-hidden card-glow">
                    {item.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                      <p className="text-white/50 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/[0.06] rounded-3xl">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-white/30" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No portfolio items yet</h3>
                  <p className="text-white/50">This creator hasn&apos;t added any portfolio items.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
