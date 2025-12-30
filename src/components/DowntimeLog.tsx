import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, X } from 'lucide-react';

interface DowntimeLogProps {
  user: any;
  accessToken: string | null;
}

export function DowntimeLog({ user, accessToken }: DowntimeLogProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    production_order_id: '',
    reason: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, ordersRes, productsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/downtime-events`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/production-orders`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/products`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [eventsData, ordersData, productsData] = await Promise.all([
        eventsRes.json(),
        ordersRes.json(),
        productsRes.json()
      ]);

      setEvents(eventsData.events || []);
      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/downtime-events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        fetchData();
        setShowModal(false);
        setFormData({ production_order_id: '', reason: '', start_time: '', end_time: '' });
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to create downtime event'));
      }
    } catch (error) {
      console.error('Error creating downtime event:', error);
      alert('Error creating downtime event');
    }
  };

  const openAddModal = () => {
    const now = new Date().toISOString().slice(0, 16);
    setFormData({ 
      production_order_id: orders[0]?.id || '', 
      reason: '', 
      start_time: now,
      end_time: now
    });
    setShowModal(true);
  };

  const getProductName = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 'Unknown';
    return products.find(p => p.id === order.product_id)?.name || 'Unknown';
  };

  const calculateDuration = (start: string, end: string) => {
    const durationMs = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateCost = (start: string, end: string) => {
    const durationHours = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    const costPerHour = 100; // $100/hour downtime cost
    return durationHours * costPerHour;
  };

  if (loading) {
    return <div className="text-center py-12">Loading downtime events...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Downtime Log</h1>
          <p className="text-gray-600">Track production interruptions and costs</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={orders.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Downtime
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            No production orders available. Create production orders first.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-gray-600">Reason</th>
                <th className="text-left py-3 px-4 text-gray-600">Start Time</th>
                <th className="text-left py-3 px-4 text-gray-600">End Time</th>
                <th className="text-left py-3 px-4 text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-gray-600">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No downtime events logged yet.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{getProductName(event.production_order_id)}</td>
                    <td className="py-3 px-4 text-gray-900">{event.reason}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(event.start_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(event.end_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {calculateDuration(event.start_time, event.end_time)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      ${calculateCost(event.start_time, event.end_time).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Downtime Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Log Downtime Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Production Order</label>
                <select
                  value={formData.production_order_id}
                  onChange={(e) => setFormData({ ...formData, production_order_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {getProductName(order.id)} - {order.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Reason</label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Machine Breakdown">Machine Breakdown</option>
                  <option value="Power Outage">Power Outage</option>
                  <option value="Material Shortage">Material Shortage</option>
                  <option value="Maintenance">Scheduled Maintenance</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Staff Shortage">Staff Shortage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  Estimated cost: $100/hour downtime rate
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Log Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
