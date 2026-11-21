import { Settings as SettingsIcon } from 'lucide-react';
import AdminPlaceholder from '../../components/admin/AdminPlaceholder.jsx';

function Settings() {
  return (
    <AdminPlaceholder
      icon={SettingsIcon}
      title="Settings"
      description="Configure restaurant profile, operational preferences, and staff options."
    />
  );
}

export default Settings;