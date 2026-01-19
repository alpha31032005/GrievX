import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';

const columns = ['ID', 'Title', 'Department', 'Priority', 'Status', 'Date'];

export default function AdminComplaintTable({ complaints = [], onRowClick }) {
  if (!complaints.length) {
    return <p className="text-gray-500 text-center py-8">No complaints found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {complaints.map((c) => (
            <tr
              key={c._id}
              onClick={() => onRowClick?.(c)}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-4 py-3 text-sm text-blue-600">C-{c._id.slice(-4)}</td>
              <td className="px-4 py-3 text-sm font-medium">{c.title}</td>
              <td className="px-4 py-3 text-sm capitalize">{c.category?.replace('_', ' ')}</td>
              <td className="px-4 py-3"><PriorityBadge priority={c.severity} /></td>
              <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(c.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}