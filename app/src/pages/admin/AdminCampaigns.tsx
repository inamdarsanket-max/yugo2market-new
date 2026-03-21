import { useState, useEffect } from 'react';

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
  Briefcase,
  Calendar,
  DollarSign
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400'
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchCampaigns();
  }, [pagination.page, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await axios.get(`${API_URL}/admin/campaigns?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data.campaigns);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (campaignId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/campaigns/${campaignId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const statuses = ['All', 'Draft', 'Pending', 'Active', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaigns</h1>
          <p className="text-muted-foreground">Manage all platform campaigns</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status.toLowerCase().replace(' ', '_')}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign: any) => (
            <Card key={campaign._id} className="bg-card/50 border-white/10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{campaign.title}</h3>
                      <Badge className={statusColors[campaign.status]}>
                        {campaign.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {campaign.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        ₹{campaign.budget.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span className="text-muted-foreground">
                        Brand: {campaign.brand?.name}
                      </span>
                      <span className="text-muted-foreground">
                        Influencer: {campaign.influencer?.user?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={campaign.status}
                      onValueChange={(value) => updateStatus(campaign._id, value)}
                    >
                      <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.slice(1).map((status) => (
                          <SelectItem key={status} value={status.toLowerCase().replace(' ', '_')}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card/50 border-white/10">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No campaigns found</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            className="border-white/20 text-white"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            className="border-white/20 text-white"
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
