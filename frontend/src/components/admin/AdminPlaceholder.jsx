import { motion } from 'framer-motion';

function AdminPlaceholder({ icon: Icon, title, description }) {
  return (
    <motion.section
      className="admin-placeholder"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
    >
      <div className="admin-placeholder-icon">{Icon && <Icon size={28} strokeWidth={1.5} />}</div>
      <p className="admin-demo-label">Phase coming soon</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </motion.section>
  );
}

export default AdminPlaceholder;
