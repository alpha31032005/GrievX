export default function AdminStatsCard({ title, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
    yellow: 'bg-accent-warning/10 text-accent-warning dark:bg-accent-warning/20',
    green: 'bg-accent-success/10 text-accent-success dark:bg-accent-success/20',
    red: 'bg-accent-danger/10 text-accent-danger dark:bg-accent-danger/20',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-4 flex items-center gap-4 transition-all hover:shadow-lg">
      <div className={`p-3 rounded-full ${colors[color]} transition-transform hover:scale-110`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
