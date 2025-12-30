import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Package, AlertTriangle, DollarSign, Clock, RefreshCw } from 'lucide-react';

interface DashboardProps {
  user: any;
  accessToken: string | null;
}

export function Dashboard({ user, accessToken }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will create sample data for testing. Continue?')) return;
    
    setSeeding(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/seed-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        alert('Sample data created successfully!');
        fetchDashboardData();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to seed data'));
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
        <button
          onClick={fetchDashboardData}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summary, recent_orders, stock_alerts } = dashboardData;

  const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        {user?.role === 'Owner' && (
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {seeding ? 'Creating...' : 'Create Sample Data'}
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Today's Production</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-gray-900">{summary.total_produced_today.toLocaleString()} units</p>
          <p className="text-sm text-gray-500">{summary.orders_today} orders completed</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Low Stock Items</p>
            <AlertTriangle className={`w-5 h-5 ${summary.low_stock_items > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-gray-900">{summary.low_stock_items}</p>
          <p className="text-sm text-gray-500">Needs reorder</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Production Cost</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-gray-900">${summary.total_production_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">{summary.completed_orders_count} orders</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Downtime Cost</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-gray-900">${summary.total_downtime_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">Total downtime losses</p>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-900 mb-4">Recent Production Orders</h3>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-gray-600">Status</th>
                  <th className="text-left py-2 px-2 text-gray-600">Target Qty</th>
                  <th className="text-left py-2 px-2 text-gray-600">Actual Qty</th>
                </tr>
              </thead>
              <tbody>
                {recent_orders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-gray-500">No orders yet</td>
                  </tr>
                ) : (
                  recent_orders.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-100">
                      <td className="py-2 px-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-900">{order.target_qty}</td>
                      <td className="py-2 px-2 text-gray-900">{order.actual_produced_qty || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-900 mb-4">Stock Alerts</h3>
          <div className="space-y-3">
            {stock_alerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No stock alerts</p>
            ) : (
              stock_alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900">{alert.name}</p>
                      <p className="text-sm text-gray-600">
                        Current: {alert.current_stock.toFixed(2)} {alert.unit} | 
                        Reorder: {alert.reorder_point} {alert.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cost Breakdown Chart */}
      {summary.total_production_cost > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-gray-900 mb-4">Cost Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Production Cost', value: summary.total_production_cost },
              { name: 'Downtime Cost', value: summary.total_downtime_cost }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
