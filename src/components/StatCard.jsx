const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass = "bg-blue-500",
  textColor = "text-blue-600",
  bgLight = "bg-blue-50",
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${bgLight} p-3 rounded-xl`}>
        <Icon className={`w-6 h-6 ${textColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-800 mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
