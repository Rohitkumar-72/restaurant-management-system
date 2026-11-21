import { ReceiptText } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function Orders() {
  return (
    <AdminPlaceholder
      icon={ReceiptText}
      title="Orders"
      description="Review incoming orders, track preparation, and update fulfillment status."
    />
  );
}

export default Orders;