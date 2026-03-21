import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Loader2,
  Star,
  ArrowUpRight
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: `+${stats?.users?.newToday || 0} today`,
      icon: Users,
      color: 'text-creator-blue',
      bgColor: 'bg-creator-blue/10',
      gradient: 'from-creator-blue to-creator-purple'
    },
    {
      title: 'Total Creators',
      value: stats?.users?.influencers || 0,
      change: `${((stats?.users?.influencers / stats?.users?.total) * 100).toFixed(0)}% of users`,
      icon: Star,
      color: 'text-creator-pink',
      bgColor: 'bg-creator-pink/10',
      gradient: 'from-creator-pink to-creator-purple'
    },
    {
      title: 'Active Campaigns',
      value: stats?.campaigns?.active || 0,
      change: `${stats?.campaigns?.pending || 0} pending`,
      icon: Briefcase,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.payments?.totalRevenue || 0).toLocaleString()}`,
      change: `+₹${(stats?.payments?.revenueThisMonth || 0).toLocaleString()} this month`,
      icon: DollarSign,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      gradient: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
          <TrendingUp className="w-4 h-4 text-red-500" />
          <span className="text-sm text-white/70">Admin Dashboard</span>
        </div>
        <h1 className="text-4xl font-black text-white">Platform Overview</h1>
        <p className="text-white/50 mt-2">Monitor your platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card border-white/[0.06] rounded-3xl card-glow overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <p className="text-sm text-white/50 mb-1">{stat.title}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="glass-card border-white/[0.06] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.users?.map((user: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                    <span className="text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-sm text-white/50">{user.email}</p>
                  </div>
                  <Badge className="bg-white/10 text-white capitalize border-0 rounded-full">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="glass-card border-white/[0.06] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.campaigns?.map((campaign: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-creator-blue/20 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-creator-blue" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{campaign.title}</p>
                    <p className="text-sm text-white/50">{campaign.brand?.name}</p>
                  </div>
                  <Badge className="bg-white/10 text-white capitalize border-0 rounded-full">
                    {campaign.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Stats */}
      <Card className="glass-card border-white/[0.06] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Campaign Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats?.campaigns?.total || 0, color: 'text-white', bg: 'bg-white/5' },
              { label: 'Active', value: stats?.campaigns?.active || 0, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Pending', value: stats?.campaigns?.pending || 0, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { label: 'Completed', value: stats?.campaigns?.completed || 0, color: 'text-creator-purple', bg: 'bg-creator-purple/10' }
            ].map((item, idx) => (
              <div key={idx} className={`text-center p-5 rounded-2xl ${item.bg}`}>
                <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
                <p className="text-sm text-white/50 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
