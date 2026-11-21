import { BarChart3 } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function AdminAnalytics() {
  return (
    <AdminPlaceholder
      icon={BarChart3}
      title="Analytics"
      description="Explore revenue, order volume, service trends, and popular dishes."
    />
  );
}

export default AdminAnalytics;
