import { BarChart3, FolderPlus, ReceiptText, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  { label: 'View Orders', icon: ReceiptText, to: '/admin/orders' },
  { label: 'Manage Menu', icon: UtensilsCrossed, to: '/admin/menu-management' },
  { label: 'Add Category', icon: FolderPlus, to: '/admin/categories' },
  { label: 'View Analytics', icon: BarChart3, to: '/admin/analytics' },
];

function QuickActions() {
  return (
    <article className="admin-panel quick-actions-panel">
      <div className="admin-panel-heading">
        <div><span>Quick actions</span><strong>Staff shortcuts</strong></div>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.to} className="quick-action">
              <Icon size={18} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </article>
  );
}

export default QuickActions;
