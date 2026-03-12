const STATUS_STYLES = {
  open: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {status?.replace(/_/g, ' ').replace(/-/g, ' ')}
    </span>
  );
}
