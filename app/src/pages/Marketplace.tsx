import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Users, 
  Star, 
  MapPin, 
  Instagram, 
  Youtube, 
  Twitter,
  Filter,
  X,
  Loader2,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = [
  'All',
  'Fashion',
  'Beauty',
  'Tech',
  'Food',
  'Travel',
  'Fitness',
  'Gaming',
  'Lifestyle',
  'Business',
  'Education',
  'Entertainment',
  'Sports',
  'Health',
  'Finance'
];

export default function Marketplace() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchInfluencers();
  }, [pagination.page, selectedCategory, sortBy]);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '12',
        sortBy,
        ...(selectedCategory !== 'All' && { category: selectedCategory.toLowerCase() }),
        ...(search && { search })
      });

      const response = await axios.get(`${API_URL}/influencers?${params}`);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInfluencers();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSortBy('rating');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <TrendingUp className="w-4 h-4 text-creator-pink" />
            <span className="text-sm text-white/80">Marketplace</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6">
            Find Your Perfect <span className="gradient-text">Creator</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Browse thousands of local influencers across different niches and find the perfect match for your brand.
          </p>
        </div>

        {/* Search and Filters - Glass */}
        <div className="mb-10">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search by name, niche, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 py-6 glass-strong border-white/10 text-white placeholder:text-white/30 rounded-2xl text-lg"
              />
            </div>
            <Button type="submit" className="gradient-bg text-white rounded-2xl px-8 py-6 btn-glow">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white lg:hidden rounded-2xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </form>

          {/* Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <Card className="glass-card border-white/[0.06] rounded-2xl">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="w-full sm:w-auto">
                    <label className="text-sm text-white/50 mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-44 glass border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/10">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-auto">
                    <label className="text-sm text-white/50 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-44 glass border-white/10 text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/10">
                        <SelectItem value="rating" className="text-white hover:bg-white/10">Rating</SelectItem>
                        <SelectItem value="followers" className="text-white hover:bg-white/10">Followers</SelectItem>
                        <SelectItem value="newest" className="text-white hover:bg-white/10">Newest</SelectItem>
                        <SelectItem value="price_low" className="text-white hover:bg-white/10">Price: Low to High</SelectItem>
                        <SelectItem value="price_high" className="text-white hover:bg-white/10">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 flex justify-end items-end">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-white/50 hover:text-white hover:bg-white/5"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-white/50">
            Showing <span className="text-white font-semibold">{influencers.length}</span> of <span className="text-white font-semibold">{pagination.total}</span> creators
          </p>
        </div>

        {/* Influencers Grid - Premium Creator Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-creator-pink" />
          </div>
        ) : influencers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {influencers.map((influencer: any) => (
              <Link
                key={influencer._id}
                to={`/influencer/${influencer._id}`}
                className="group relative overflow-hidden rounded-3xl glass-card card-glow"
              >
                {/* Cover Image */}
                <div className="aspect-[4/5] overflow-hidden relative">
                  <img
                    src={influencer.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.user?.name}`}
                    alt={influencer.user?.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
                  
                  {/* Featured Badge */}
                  {influencer.isFeatured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold border-0">
                        <Star className="w-3 h-3 mr-1 fill-black" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {/* Name & Rating */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-white text-xl group-hover:text-creator-pink transition-colors">
                        {influencer.user?.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {influencer.categories?.slice(0, 2).join(', ') || 'Creator'}
                      </p>
                    </div>
                    {influencer.rating > 0 && (
                      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-white">{influencer.rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  {influencer.location?.city && (
                    <div className="flex items-center gap-1 text-sm text-white/50 mb-3">
                      <MapPin className="w-4 h-4" />
                      {influencer.location.city}
                    </div>
                  )}

                  {/* Stats & Pricing */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      {influencer.socialMedia?.slice(0, 2).map((social: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1 text-sm text-white/70">
                          {getSocialIcon(social.platform)}
                          <span className="font-semibold">{formatFollowers(social.followers)}</span>
                        </div>
                      ))}
                    </div>
                    {influencer.pricing?.[0]?.price && (
                      <span className="text-lg font-bold gradient-text">
                        ₹{(influencer.pricing[0].price / 1000).toFixed(0)}K
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No creators found</h3>
            <p className="text-white/50">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
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
    </div>
  );
}
