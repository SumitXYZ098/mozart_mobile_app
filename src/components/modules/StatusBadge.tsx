import React from "react";
import { Text } from "react-native";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  "In-Progress": "bg-[#E1BE2129] text-[#E1BE21]",
  Completed: "bg-green-100 text-green-600",
  Pending: "bg-orange-100 text-orange-500",
  "In-Review": "bg-lightPrimary text-primary",
  Cancelled: "bg-red-100 text-red-600",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const baseClasses =
    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap";
  const style = statusStyles[status] || "bg-gray-100 text-gray-500";

  return <Text className={`${baseClasses} ${style}`}>{status}</Text>;
};

export default StatusBadge;
