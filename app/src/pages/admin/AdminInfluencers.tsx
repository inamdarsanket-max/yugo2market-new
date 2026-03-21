import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Loader2, 
  Star,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminInfluencers() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchInfluencers();
  }, [pagination.page, categoryFilter]);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });

      const response = await axios.get(`${API_URL}/admin/influencers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInfluencers(response.data.influencers);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (influencerId: string, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/influencers/${influencerId}/featured`, { isFeatured: !isFeatured }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInfluencers();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const categories = ['All', 'Fashion', 'Beauty', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming', 'Lifestyle'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white/70">Creators</span>
          </div>
          <h1 className="text-4xl font-black text-white">Manage Creators</h1>
          <p className="text-white/50 mt-2">Manage platform creators</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <Input
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44 glass border-white/10 text-white rounded-xl py-6">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()} className="text-white hover:bg-white/10">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Influencers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-red-500" />
        </div>
      ) : influencers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer: any) => (
            <Card key={influencer._id} className="glass-card border-white/[0.06] rounded-3xl card-glow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {influencer.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{influencer.user?.name}</p>
                      <p className="text-sm text-white/50">{influencer.user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(influencer._id, influencer.isFeatured)}
                    className={influencer.isFeatured ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/30 hover:text-white/50'}
                  >
                    <Star className={`w-6 h-6 ${influencer.isFeatured ? 'fill-yellow-400' : ''}`} />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {influencer.categories?.slice(0, 3).map((cat: string, idx: number) => (
                    <Badge key={idx} className="bg-white/10 text-white text-xs border-0 rounded-full px-3 py-1">
                      {cat}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center mb-5">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xl font-black text-white">{influencer.rating || '0'}</p>
                    <p className="text-xs text-white/50">Rating</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xl font-black text-white">{influencer.totalCampaigns || '0'}</p>
                    <p className="text-xs text-white/50">Campaigns</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xl font-black text-white">{influencer.totalReviews || '0'}</p>
                    <p className="text-xs text-white/50">Reviews</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={influencer.user?.isActive ? 'bg-green-500/20 text-green-400 border-0 rounded-full' : 'bg-red-500/20 text-red-400 border-0 rounded-full'}>
                    {influencer.user?.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {influencer.user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Link to={`/influencer/${influencer._id}`}>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 rounded-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card border-white/[0.06] rounded-3xl">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white/30" />
            </div>
            <p className="text-white/50">No creators found</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-full px-6"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-white/50 px-4">
            Page <span className="text-white font-semibold">{pagination.page}</span> of <span className="text-white font-semibold">{pagination.totalPages}</span>
          </span>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 rounded-full px-6"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
