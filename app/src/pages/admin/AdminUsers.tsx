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
  Ban,
  Shield,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(search && { search })
      });

      const response = await axios.get(`${API_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      setPagination({
        page: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/users/${userId}/make-admin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-white/70">Users</span>
          </div>
          <h1 className="text-4xl font-black text-white">Manage Users</h1>
          <p className="text-white/50 mt-2">Manage platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-6 glass-strong border-white/10 text-white rounded-xl"
            />
          </div>
          <Button type="submit" className="bg-red-500 text-white rounded-xl px-6 btn-glow hover:bg-red-600">
            Search
          </Button>
        </form>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44 glass border-white/10 text-white rounded-xl py-6">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-white/10">
            <SelectItem value="all" className="text-white hover:bg-white/10">All Roles</SelectItem>
            <SelectItem value="user" className="text-white hover:bg-white/10">Brand</SelectItem>
            <SelectItem value="influencer" className="text-white hover:bg-white/10">Creator</SelectItem>
            <SelectItem value="admin" className="text-white hover:bg-white/10">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="glass-card border-white/[0.06] rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left p-5 text-white/50 font-medium">User</th>
                    <th className="text-left p-5 text-white/50 font-medium">Role</th>
                    <th className="text-left p-5 text-white/50 font-medium">Status</th>
                    <th className="text-left p-5 text-white/50 font-medium">Joined</th>
                    <th className="text-right p-5 text-white/50 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user._id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{user.name}</p>
                            <p className="text-sm text-white/50">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <Badge className="bg-white/10 text-white capitalize border-0 rounded-full px-3 py-1">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-5">
                        <Badge className={user.isActive ? 'bg-green-500/20 text-green-400 border-0 rounded-full' : 'bg-red-500/20 text-red-400 border-0 rounded-full'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-5 text-white/50">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user._id)}
                            className={user.isActive ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl' : 'text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl'}
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          {user.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => makeAdmin(user._id)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl"
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/50">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

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
