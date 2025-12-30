import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, Play, CheckCircle, X } from 'lucide-react';

interface ProductionOrdersProps {
  user: any;
  accessToken: string | null;
}

export function ProductionOrders({ user, accessToken }: ProductionOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [completingOrder, setCompletingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    target_qty: '',
    scheduled_start: ''
  });
  const [actualProducedQty, setActualProducedQty] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/production-orders`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/products`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [ordersData, productsData] = await Promise.all([
        ordersRes.json(),
        productsRes.json()
      ]);

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
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/production-orders`,
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
        setFormData({ product_id: '', target_qty: '', scheduled_start: '' });
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to create production order'));
      }
    } catch (error) {
      console.error('Error creating production order:', error);
      alert('Error creating production order');
    }
  };

  const handleStart = async (orderId: string) => {
    if (!confirm('Start this production order?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/production-orders/${orderId}/start`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to start order'));
      }
    } catch (error) {
      console.error('Error starting order:', error);
      alert('Error starting order');
    }
  };

  const openCompleteModal = (order: any) => {
    setCompletingOrder(order);
    setActualProducedQty(order.target_qty.toString());
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/production-orders/${completingOrder.id}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ actual_produced_qty: parseFloat(actualProducedQty) })
        }
      );

      if (response.ok) {
        fetchData();
        setCompletingOrder(null);
        setActualProducedQty('');
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to complete order'));
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order');
    }
  };

  const openAddModal = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData({ 
      product_id: products[0]?.id || '', 
      target_qty: '', 
      scheduled_start: tomorrow.toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'scheduled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading production orders...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Production Orders</h1>
          <p className="text-gray-600">Create and manage production schedules</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={products.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Order
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Please create products first before creating production orders.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600">Product</th>
                <th className="text-left py-3 px-4 text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-gray-600">Target Qty</th>
                <th className="text-left py-3 px-4 text-gray-600">Actual Qty</th>
                <th className="text-left py-3 px-4 text-gray-600">Scheduled Start</th>
                <th className="text-right py-3 px-4 text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No production orders yet. Click "New Order" to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{getProductName(order.product_id)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{order.target_qty}</td>
                    <td className="py-3 px-4 text-gray-900">{order.actual_produced_qty || '-'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.scheduled_start).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'scheduled' && (
                          <button
                            onClick={() => handleStart(order.id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Start production"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={() => openCompleteModal(order)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Complete production"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">New Production Order</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Target Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_qty}
                  onChange={(e) => setFormData({ ...formData, target_qty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Scheduled Start</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Order Modal */}
      {completingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Complete Production Order</h3>
              <button
                onClick={() => setCompletingOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComplete} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Product:</strong> {getProductName(completingOrder.product_id)}
                </p>
                <p className="text-gray-700">
                  <strong>Target Quantity:</strong> {completingOrder.target_qty}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Actual Produced Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={actualProducedQty}
                  onChange={(e) => setActualProducedQty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will automatically consume raw materials from inventory based on BOM
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCompletingOrder(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Complete Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
