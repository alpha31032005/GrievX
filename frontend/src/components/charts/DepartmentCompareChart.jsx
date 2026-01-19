import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// data shape: [{ department: 'Garbage', pending: 50, resolved: 120 }, ...]
export default function DepartmentCompareChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md dark:shadow-gray-900 h-72 transition-all hover:shadow-lg">
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Department Comparison</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="#6b7280" />
          <YAxis dataKey="department" type="category" width={80} stroke="#6b7280" />
          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Bar dataKey="resolved" fill="#10b981" stackId="a" />
          <Bar dataKey="pending" fill="#f59e0b" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
