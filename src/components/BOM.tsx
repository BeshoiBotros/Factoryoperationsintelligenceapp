import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { Plus, Trash2, X } from 'lucide-react';

interface BOMProps {
  user: any;
  accessToken: string | null;
}

export function BOM({ user, accessToken }: BOMProps) {
  const [boms, setBoms] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [formData, setFormData] = useState({
    product_id: '',
    raw_material_id: '',
    qty_per_unit: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bomsRes, productsRes, materialsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/bom`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/products`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-102b7931/raw-materials`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
      ]);

      const [bomsData, productsData, materialsData] = await Promise.all([
        bomsRes.json(),
        productsRes.json(),
        materialsRes.json()
      ]);

      setBoms(bomsData.boms || []);
      setProducts(productsData.products || []);
      setMaterials(materialsData.materials || []);
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
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/bom`,
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
        setFormData({ product_id: '', raw_material_id: '', qty_per_unit: '' });
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to create BOM entry'));
      }
    } catch (error) {
      console.error('Error creating BOM:', error);
      alert('Error creating BOM entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this BOM entry?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/bom/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchData();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to delete BOM entry'));
      }
    } catch (error) {
      console.error('Error deleting BOM:', error);
      alert('Error deleting BOM entry');
    }
  };

  const openAddModal = () => {
    setFormData({ 
      product_id: selectedProduct || (products[0]?.id || ''), 
      raw_material_id: materials[0]?.id || '', 
      qty_per_unit: '' 
    });
    setShowModal(true);
  };

  const filteredBoms = selectedProduct 
    ? boms.filter(bom => bom.product_id === selectedProduct)
    : boms;

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Unknown';
  };

  const getMaterialName = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.name || 'Unknown';
  };

  const getMaterialUnit = (materialId: string) => {
    return materials.find(m => m.id === materialId)?.unit || '';
  };

  if (loading) {
    return <div className="text-center py-12">Loading BOM data...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-gray-900 mb-2">Bill of Materials (BOM)</h1>
          <p className="text-gray-600">Define raw material requirements for each product</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={products.length === 0 || materials.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add BOM Entry
        </button>
      </div>

      {products.length === 0 || materials.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Please create products and raw materials first before defining BOM entries.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Filter by Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600">Product</th>
                  <th className="text-left py-3 px-4 text-gray-600">Raw Material</th>
                  <th className="text-left py-3 px-4 text-gray-600">Qty per Unit</th>
                  <th className="text-right py-3 px-4 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No BOM entries yet. Click "Add BOM Entry" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredBoms.map((bom) => (
                    <tr key={bom.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{getProductName(bom.product_id)}</td>
                      <td className="py-3 px-4 text-gray-900">{getMaterialName(bom.raw_material_id)}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {bom.qty_per_unit} {getMaterialUnit(bom.raw_material_id)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(bom.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-gray-900">Add BOM Entry</h3>
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
                <label className="block text-gray-700 mb-2">Quantity per Unit</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.qty_per_unit}
                  onChange={(e) => setFormData({ ...formData, qty_per_unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  How much of this material is needed per unit of product
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
