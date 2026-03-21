import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Wallet,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CASHFREE_BASE_URL = import.meta.env.VITE_CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  cancelled: 'bg-white/10 text-white/50',
  refunded: 'bg-creator-purple/20 text-creator-purple'
};

const typeLabels: Record<string, string> = {
  campaign_deposit: 'Campaign Deposit',
  milestone_payment: 'Milestone Payment',
  wallet_recharge: 'Wallet Recharge',
  withdrawal: 'Withdrawal',
  refund: 'Refund'
};

export default function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/payments/my-payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/payments/create-order`, {
        amount: parseFloat(rechargeAmount),
        type: 'wallet_recharge'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.paymentSessionId) {
        // If mock mode, show success message
        if (response.data.mockMode) {
          // Verify the payment immediately for mock mode
          await axios.post(`${API_URL}/payments/verify`, {
            orderId: response.data.orderId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          alert('Payment successful! (Mock Mode)');
          fetchPayments();
          // Refresh user data to update wallet
          window.location.reload();
        } else {
          // Redirect to Cashfree checkout
          const cashfree = (window as any).Cashfree;
          if (cashfree) {
            cashfree.checkout({
              paymentSessionId: response.data.paymentSessionId,
              returnUrl: `${window.location.origin}/dashboard/payments?order_id=${response.data.orderId}`
            });
          } else {
            // Fallback: redirect to Cashfree
            window.location.href = `${CASHFREE_BASE_URL}/orders/${response.data.orderId}`;
          }
        }
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Check for payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.post(`${API_URL}/payments/verify`, {
            orderId
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          alert('Payment verified successfully!');
          fetchPayments();
          // Clear URL params
          window.history.replaceState({}, '', window.location.pathname);
          // Refresh to update wallet
          window.location.reload();
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      };
      
      verifyPayment();
    }
  }, []);

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
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
          <TrendingUp className="w-4 h-4 text-creator-pink" />
          <span className="text-sm text-white/70">Payments</span>
        </div>
        <h1 className="text-4xl font-black text-white">Payments & Wallet</h1>
        <p className="text-white/50 mt-2">Manage your payments and wallet balance</p>
      </div>

      {/* Wallet Card - Premium */}
      <Card className="gradient-bg-animated border-0 rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 glow-gradient opacity-30" />
        <CardContent className="p-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <p className="text-white/70 text-lg">Wallet Balance</p>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white">
                ₹{user?.wallet?.balance?.toLocaleString() || '0'}
              </h2>
              <p className="text-white/50 mt-2">{user?.wallet?.currency || 'INR'}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-36 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                />
                <Button 
                  className="bg-white text-creator-pink hover:bg-white/90 rounded-xl px-6 btn-glow"
                  onClick={handleRecharge}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Recharge
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="glass p-1 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">All</TabsTrigger>
          <TabsTrigger value="incoming" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Incoming</TabsTrigger>
          <TabsTrigger value="outgoing" className="data-[state=active]:gradient-bg data-[state=active]:text-white rounded-lg px-5">Outgoing</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment: any) => (
              <Card key={payment._id} className="glass-card border-white/[0.06] rounded-2xl card-glow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        ['wallet_recharge', 'refund'].includes(payment.type) 
                          ? 'bg-green-500/20' 
                          : 'bg-red-500/20'
                      }`}>
                        {['wallet_recharge', 'refund'].includes(payment.type) ? (
                          <ArrowDownLeft className="w-6 h-6 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{typeLabels[payment.type]}</p>
                        <p className="text-sm text-white/50">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xl ${
                        ['wallet_recharge', 'refund'].includes(payment.type) 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {['wallet_recharge', 'refund'].includes(payment.type) ? '+' : '-'}
                        ₹{payment.amount.toLocaleString()}
                      </p>
                      <Badge className={`${statusColors[payment.status]} border-0 rounded-full mt-1`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-card border-white/[0.06] rounded-2xl">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-10 h-10 text-white/30" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No payments yet</h3>
                <p className="text-white/50">Your payment history will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          {payments.filter((p: any) => ['wallet_recharge', 'refund'].includes(p.type)).length > 0 ? (
            payments
              .filter((p: any) => ['wallet_recharge', 'refund'].includes(p.type))
              .map((payment: any) => (
                <Card key={payment._id} className="glass-card border-white/[0.06] rounded-2xl card-glow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <ArrowDownLeft className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{typeLabels[payment.type]}</p>
                          <p className="text-sm text-white/50">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-green-400">
                          +₹{payment.amount.toLocaleString()}
                        </p>
                        <Badge className={`${statusColors[payment.status]} border-0 rounded-full mt-1`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="glass-card border-white/[0.06] rounded-2xl">
              <CardContent className="p-16 text-center">
                <p className="text-white/50">No incoming payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {payments.filter((p: any) => ['campaign_deposit', 'milestone_payment'].includes(p.type)).length > 0 ? (
            payments
              .filter((p: any) => ['campaign_deposit', 'milestone_payment'].includes(p.type))
              .map((payment: any) => (
                <Card key={payment._id} className="glass-card border-white/[0.06] rounded-2xl card-glow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                          <ArrowUpRight className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{typeLabels[payment.type]}</p>
                          <p className="text-sm text-white/50">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-red-400">
                          -₹{payment.amount.toLocaleString()}
                        </p>
                        <Badge className={`${statusColors[payment.status]} border-0 rounded-full mt-1`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="glass-card border-white/[0.06] rounded-2xl">
              <CardContent className="p-16 text-center">
                <p className="text-white/50">No outgoing payments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
