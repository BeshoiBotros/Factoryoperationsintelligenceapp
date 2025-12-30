import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CostReportsProps {
  user: any;
  accessToken: string | null;
}

export function CostReports({ user, accessToken }: CostReportsProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/cost-reports`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.cost_reports || []);
      }
    } catch (error) {
      console.error('Error fetching cost reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading cost reports...</div>;
  }

  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const totalCost = reports.reduce((sum, r) => sum + r.material_cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = reports.length > 0 
    ? reports.reduce((sum, r) => sum + r.margin_percent, 0) / reports.length 
    : 0;

  const chartData = reports.slice(0, 10).map(report => ({
    name: `${report.product_name?.substring(0, 10)}...`,
    cost: report.cost_per_unit,
    price: report.selling_price,
    margin: report.margin_percent
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Cost Reports</h1>
        <p className="text-gray-600">Production cost analysis and profit margins</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-gray-900">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">{reports.length} completed orders</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Cost</p>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-gray-900">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">Material costs only</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Net Profit</p>
            {totalProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className={`text-gray-900 ${totalProfit < 0 ? 'text-red-600' : ''}`}>
            ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500">Revenue - Costs</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Avg Margin</p>
            {avgMargin >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className={`text-gray-900 ${avgMargin < 0 ? 'text-red-600' : ''}`}>
            {avgMargin.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">Average profit margin</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-gray-900 mb-4">Cost vs Selling Price</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="cost" fill="#EF4444" name="Cost per Unit" />
              <Bar dataKey="price" fill="#10B981" name="Selling Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-gray-600">Product</th>
              <th className="text-left py-3 px-4 text-gray-600">Qty Produced</th>
              <th className="text-left py-3 px-4 text-gray-600">Cost/Unit</th>
              <th className="text-left py-3 px-4 text-gray-600">Sell Price</th>
              <th className="text-left py-3 px-4 text-gray-600">Total Cost</th>
              <th className="text-left py-3 px-4 text-gray-600">Revenue</th>
              <th className="text-left py-3 px-4 text-gray-600">Profit</th>
              <th className="text-left py-3 px-4 text-gray-600">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  No completed production orders yet.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.order_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{report.product_name}</td>
                  <td className="py-3 px-4 text-gray-600">{report.produced_qty}</td>
                  <td className="py-3 px-4 text-gray-900">${report.cost_per_unit.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-900">${report.selling_price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-900">${report.material_cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-900">${report.revenue.toFixed(2)}</td>
                  <td className={`py-3 px-4 ${report.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${report.profit.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 ${report.margin_percent < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {report.margin_percent.toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Alerts for negative margins */}
      {reports.some(r => r.margin_percent < 0) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 mb-2">⚠️ Negative Margin Alert</h3>
          <p className="text-red-700">
            Some products have negative profit margins. Review pricing or production costs:
          </p>
          <ul className="mt-2 list-disc list-inside text-red-700">
            {reports
              .filter(r => r.margin_percent < 0)
              .map(r => (
                <li key={r.order_id}>
                  {r.product_name}: {r.margin_percent.toFixed(1)}% margin
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
