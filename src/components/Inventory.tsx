import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, X, AlertTriangle } from 'lucide-react';

interface InventoryProps {
  user: any;
  accessToken: string | null;
}

export function Inventory({ user, accessToken }: InventoryProps) {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    raw_material_id: '',
    tx_type: 'purchase',
    qty: '',
    unit_cost: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, materialsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/inventory`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [inventoryData, materialsData] = await Promise.all([
        inventoryRes.json(),
        materialsRes.json()
      ]);

      setInventory(inventoryData.inventory || []);
      setMaterials(materialsData.materials || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/inventory-transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ...formData,
            qty: formData.tx_type === 'adjustment' && parseFloat(formData.qty) < 0 
              ? parseFloat(formData.qty)
              : Math.abs(parseFloat(formData.qty))
          })
        }
      );

      if (response.ok) {
        fetchData();
        setShowModal(false);
        setFormData({ raw_material_id: '', tx_type: 'purchase', qty: '', unit_cost: '' });
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to create transaction'));
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error creating transaction');
    }
  };

  const openAddModal = () => {
    setFormData({ 
      raw_material_id: materials[0]?.id || '', 
      tx_type: 'purchase', 
      qty: '', 
      unit_cost: '' 
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Inventory</h1>
          <p className="text-gray-600">Current stock levels and transactions</p>
        </div>
        {['Owner', 'Plant Manager', 'Supervisor'].includes(user?.role) && (
          <button
            onClick={openAddModal}
            disabled={materials.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Please create raw materials first.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-gray-600">Material</th>
                <th className="text-left py-3 px-4 text-gray-600">Current Stock</th>
                <th className="text-left py-3 px-4 text-gray-600">Avg Unit Cost</th>
                <th className="text-left py-3 px-4 text-gray-600">Total Value</th>
                <th className="text-left py-3 px-4 text-gray-600">Reorder Point</th>
                <th className="text-left py-3 px-4 text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No inventory data yet. Add transactions to track stock.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.material_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{item.material_name}</td>
                    <td className="py-3 px-4">
                      <span className={item.total_qty < 0 ? 'text-red-600' : 'text-gray-900'}>
                        {item.total_qty.toFixed(2)} {item.material_unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      ${item.avg_unit_cost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      ${item.total_value.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.reorder_point} {item.material_unit}
                    </td>
                    <td className="py-3 px-4">
                      {item.needs_reorder ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Add Inventory Transaction</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Raw Material</label>
                <select
                  value={formData.raw_material_id}
                  onChange={(e) => setFormData({ ...formData, raw_material_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={formData.tx_type}
                  onChange={(e) => setFormData({ ...formData, tx_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="purchase">Purchase (Add Stock)</option>
                  <option value="adjustment">Adjustment (Add/Remove)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Note: Consumption is automatically recorded when completing production orders
                </p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.qty}
                  onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                {formData.tx_type === 'adjustment' && (
                  <p className="text-sm text-gray-500 mt-1">
                    Use negative values to remove stock
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
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
    </div>
  );
}
