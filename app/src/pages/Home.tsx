import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Users, 
  TrendingUp,
  Shield, 
  ArrowRight,
  Star,
  Play
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
  const [stats] = useState({
    totalInfluencers: 2500,
    totalBrands: 850,
    totalCampaigns: 12000,
    satisfactionRate: 98
  });

  useEffect(() => {
    fetchFeaturedInfluencers();
  }, []);

  const fetchFeaturedInfluencers = async () => {
    try {
      const response = await axios.get(`${API_URL}/influencers/featured`);
      setFeaturedInfluencers(response.data.influencers.slice(0, 4));
    } catch (error) {
      console.error('Error fetching featured influencers:', error);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Find Local Influencers',
      description: 'Connect with influencers in your area who understand your local market and audience.'
    },
    {
      icon: TrendingUp,
      title: 'Track Performance',
      description: 'Monitor campaign metrics, engagement rates, and ROI in real-time with detailed analytics.'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Protected transactions with milestone-based payments and escrow protection.'
    },
    {
      icon: Zap,
      title: 'Quick Campaign Setup',
      description: 'Launch campaigns in minutes with our streamlined workflow and templates.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Find Influencers',
      description: 'Browse our marketplace and filter by location, niche, and audience size.'
    },
    {
      number: '02',
      title: 'Create Campaign',
      description: 'Set your budget, deliverables, and timeline for your marketing campaign.'
    },
    {
      number: '03',
      title: 'Collaborate',
      description: 'Work directly with influencers and approve content before it goes live.'
    },
    {
      number: '04',
      title: 'Track Results',
      description: 'Monitor performance metrics and measure your campaign ROI.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Premium */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Radial Gradients */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-creator-pink/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-creator-purple/15 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-creator-blue/10 rounded-full blur-[150px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <Zap className="w-4 h-4 text-creator-pink" />
            <span className="text-sm text-white/80">The #1 Local Influencer Network</span>
          </div>

          {/* Main Heading - Large Bold Typography */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-[0.95] tracking-tight">
            <span className="text-white block mb-2">Amplify Your</span>
            <span className="text-white block mb-2">Brand with</span>
            <span className="gradient-text">Local Voices</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with local influencers who understand your market. Launch campaigns, 
            track performance, and grow your business with authentic local marketing.
          </p>

          {/* CTA Buttons - Premium */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link to="/register">
              <Button size="lg" className="gradient-bg-animated text-white border-0 rounded-full px-10 py-6 text-lg font-semibold btn-glow hover:scale-105 transition-transform">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/marketplace">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-6 text-lg font-semibold backdrop-blur-sm">
                <Play className="mr-2 w-5 h-5" />
                Explore Marketplace
              </Button>
            </Link>
          </div>

          {/* Stats - Premium Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: stats.totalInfluencers.toLocaleString(), label: 'Influencers' },
              { value: stats.totalBrands.toLocaleString(), label: 'Brands' },
              { value: stats.totalCampaigns.toLocaleString(), label: 'Campaigns' },
              { value: `${stats.satisfactionRate}%`, label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="glass-card rounded-2xl p-6 card-glow">
                <div className="text-4xl md:text-5xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-white/50 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gradient-to-b from-creator-pink to-creator-purple rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section - Glass Cards */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Star className="w-4 h-4 text-creator-purple" />
              <span className="text-sm text-white/80">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Our platform provides all the tools you need to find, connect with, and manage influencer marketing campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-card rounded-3xl p-8 card-glow group"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-creator-purple/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <TrendingUp className="w-4 h-4 text-creator-blue" />
              <span className="text-sm text-white/80">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Simple <span className="gradient-text">4-Step</span> Process
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="text-7xl font-black text-white/[0.03] mb-4 group-hover:text-creator-pink/10 transition-colors duration-500">{step.number}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 right-0 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-white/10" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Influencers Section - Premium Cards */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                <Star className="w-4 h-4 text-creator-pink" />
                <span className="text-sm text-white/80">Featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Top <span className="gradient-text">Creators</span>
              </h2>
            </div>
            <Link to="/marketplace">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-6">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredInfluencers.length > 0 ? (
              featuredInfluencers.map((influencer: any) => (
                <Link
                  key={influencer._id}
                  to={`/influencer/${influencer._id}`}
                  className="group relative overflow-hidden rounded-3xl glass-card card-glow"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={influencer.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.user?.name}`}
                      alt={influencer.user?.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white text-lg">{influencer.user?.name}</h3>
                      {influencer.rating > 4 && (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      )}
                    </div>
                    <p className="text-white/60 text-sm mb-3 line-clamp-1">
                      {influencer.categories?.slice(0, 2).join(', ') || 'General'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-white/70">
                        <Users className="w-4 h-4" />
                        {(influencer.socialMedia?.[0]?.followers / 1000).toFixed(0)}K
                      </span>
                      {influencer.pricing?.[0]?.price && (
                        <span className="text-creator-pink font-bold">
                          ₹{influencer.pricing[0].price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Mock data for display
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-3xl glass-card card-glow"
                >
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-creator-pink/20 to-creator-purple/20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                      <Users className="w-12 h-12 text-white/20" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-bold text-white text-lg mb-1">Creator {i}</h3>
                    <p className="text-white/60 text-sm mb-3">Fashion & Lifestyle</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-white/70">
                        <Users className="w-4 h-4" />
                        {(Math.random() * 100 + 50).toFixed(0)}K
                      </span>
                      <span className="text-creator-pink font-bold">₹{(Math.random() * 50 + 10).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-bg-animated p-16 text-center">
            {/* Glow Effect */}
            <div className="absolute inset-0 glow-gradient opacity-50" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                Ready to Amplify<br />Your Brand?
              </h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of brands already using Yugo2Market to connect with local influencers and grow their business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-creator-pink hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold btn-glow">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 py-6 text-lg font-semibold">
                    Browse Influencers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
