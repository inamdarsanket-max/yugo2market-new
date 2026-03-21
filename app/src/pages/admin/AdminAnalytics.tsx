import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  TrendingUp,
  Users,
  DollarSign,
  Briefcase
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-muted-foreground">Platform performance insights</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.userGrowth?.length > 0 ? (
              <div className="space-y-2">
                {analytics.userGrowth.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-white">{item._id}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 bg-blue-500 rounded"
                        style={{ width: `${Math.min(item.count * 10, 200)}px` }}
                      />
                      <span className="text-white font-medium">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Revenue Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.revenueGrowth?.length > 0 ? (
              <div className="space-y-2">
                {analytics.revenueGrowth.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-white">{item._id}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-4 bg-green-500 rounded"
                        style={{ width: `${Math.min(item.amount / 100, 200)}px` }}
                      />
                      <span className="text-white font-medium">₹{item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaign Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              Campaign Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.campaignStatus?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {analytics.campaignStatus.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/5 text-center">
                    <p className="text-2xl font-bold text-white capitalize">{item._id.replace('_', ' ')}</p>
                    <p className="text-muted-foreground">{item.count} campaigns</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="bg-card/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-400" />
              Top Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCategories?.length > 0 ? (
              <div className="space-y-3">
                {analytics.topCategories.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-6">{idx + 1}.</span>
                      <span className="text-white capitalize">{item._id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full gradient-bg rounded-full"
                          style={{ width: `${Math.min((item.count / analytics.topCategories[0].count) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-white text-sm w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
