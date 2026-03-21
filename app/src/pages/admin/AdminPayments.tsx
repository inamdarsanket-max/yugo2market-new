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
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  refunded: 'bg-purple-500/20 text-purple-400'
};

const typeLabels: Record<string, string> = {
  campaign_deposit: 'Campaign Deposit',
  milestone_payment: 'Milestone Payment',
  wallet_recharge: 'Wallet Recharge',
  withdrawal: 'Withdrawal',
  refund: 'Refund'
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await axios.get(`${API_URL}/payments/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments);
      setTotalRevenue(response.data.totalRevenue);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/payments/refund/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPayments();
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const statuses = ['All', 'Pending', 'Success', 'Failed', 'Cancelled', 'Refunded'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Payments</h1>
          <p className="text-muted-foreground">Manage all platform payments</p>
        </div>
        <Card className="bg-green-500/20 border-green-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-green-400">Total Revenue</p>
            <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
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
              <SelectItem key={status} value={status.toLowerCase()}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : payments.length > 0 ? (
        <Card className="bg-card/50 border-white/10">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-muted-foreground font-medium">Order ID</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">User</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Type</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-4 text-muted-foreground font-medium">Date</th>
                    <th className="text-right p-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment._id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-white font-mono text-sm">{payment.orderId}</td>
                      <td className="p-4">
                        <p className="text-white">{payment.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{payment.user?.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-white">{typeLabels[payment.type]}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-white font-medium">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[payment.status]}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        {payment.status === 'success' && payment.type !== 'refund' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefund(payment._id)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-white/10">
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-muted-foreground">No payments found</p>
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
