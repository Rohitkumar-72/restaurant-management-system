import { Users } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function Customers() {
  return (
    <AdminPlaceholder
      icon={Users}
      title="Customers"
      description="View customer activity and dining preferences in a future staff interface."
    />
  );
}

export default Customers;