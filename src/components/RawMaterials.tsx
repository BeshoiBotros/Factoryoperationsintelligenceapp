import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface RawMaterialsProps {
  user: any;
  accessToken: string | null;
}

export function RawMaterials({ user, accessToken }: RawMaterialsProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'kg',
    reorder_point: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingMaterial
        ? `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials/${editingMaterial.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials`;

      const response = await fetch(url, {
        method: editingMaterial ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchMaterials();
        setShowModal(false);
        setEditingMaterial(null);
        setFormData({ name: '', unit: 'kg', reorder_point: '' });
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to save raw material'));
      }
    } catch (error) {
      console.error('Error saving raw material:', error);
      alert('Error saving raw material');
    }
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      unit: material.unit,
      reorder_point: material.reorder_point.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this raw material?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchMaterials();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to delete raw material'));
      }
    } catch (error) {
      console.error('Error deleting raw material:', error);
      alert('Error deleting raw material');
    }
  };

  const openAddModal = () => {
    setEditingMaterial(null);
    setFormData({ name: '', unit: 'kg', reorder_point: '' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-12">Loading raw materials...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Raw Materials</h1>
          <p className="text-gray-600">Manage inventory items and reorder points</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Raw Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-600">Name</th>
              <th className="text-left py-3 px-4 text-gray-600">Unit</th>
              <th className="text-left py-3 px-4 text-gray-600">Reorder Point</th>
              <th className="text-right py-3 px-4 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No raw materials yet. Click "Add Raw Material" to create one.
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{material.name}</td>
                  <td className="py-3 px-4 text-gray-600">{material.unit}</td>
                  <td className="py-3 px-4 text-gray-900">{material.reorder_point}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleEdit(material)}
                      className="text-indigo-600 hover:text-indigo-700 p-1 mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user?.role === 'Owner' && (
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">
                {editingMaterial ? 'Edit Raw Material' : 'Add Raw Material'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Material Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="liter">Liters</option>
                  <option value="m">Meters (m)</option>
                  <option value="ml">Milliliters (ml)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Reorder Point</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Alert when stock falls below this level</p>
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
                  {editingMaterial ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
