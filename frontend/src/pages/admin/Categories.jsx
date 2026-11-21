import { Tags } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function Categories() {
  return (
    <AdminPlaceholder
      icon={Tags}
      title="Categories"
      description="Organize and manage restaurant menu categories and display order."
    />
  );
}

export default Categories;