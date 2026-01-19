const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium}`}>
      {priority}
    </span>
  );
}
