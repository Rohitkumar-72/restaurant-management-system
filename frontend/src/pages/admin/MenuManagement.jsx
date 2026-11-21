import { UtensilsCrossed } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function MenuManagement() {
  return (
    <AdminPlaceholder
      icon={UtensilsCrossed}
      title="Menu Management"
      description="Manage menu availability, dishes, prices, and featured selections."
    />
  );
}

export default MenuManagement;