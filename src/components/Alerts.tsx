import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface AlertsProps {
  user: any;
  accessToken: string | null;
}

export function Alerts({ user, accessToken }: AlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/alerts`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-102b7931/alerts/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchAlerts();
      } else {
        const data = await response.json();
        alert('Error: ' + (data.error || 'Failed to dismiss alert'));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      alert('Error dismissing alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-300 bg-red-50';
      case 'medium': return 'border-yellow-300 bg-yellow-50';
      case 'low': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-800';
      case 'medium': return 'text-yellow-800';
      case 'low': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading alerts...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Alerts & Notifications</h1>
        <p className="text-gray-600">System alerts for low stock and critical issues</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No active alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-6 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${getSeverityIcon(alert.severity)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`${getSeverityText(alert.severity)}`}>
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                        alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className={`${getSeverityText(alert.severity)} mb-2`}>
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className={`p-2 rounded-lg hover:bg-white/50 transition-colors ${getSeverityIcon(alert.severity)}`}
                  title="Dismiss alert"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 mb-2">About Alerts</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Low Stock Alerts:</strong> Automatically generated when raw material inventory falls below reorder point</li>
          <li>• <strong>Negative Margin Alerts:</strong> Created when production costs exceed selling price</li>
          <li>• <strong>Auto-generated:</strong> Alerts are created when completing production orders</li>
          <li>• <strong>Dismissible:</strong> Click the X to dismiss alerts you've addressed</li>
        </ul>
      </div>
    </div>
  );
}
