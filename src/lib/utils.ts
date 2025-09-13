import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatAddress = (address: string) => {
  return address.length > 50 ? `${address.substring(0, 50)}...` : address;
};

export const getStatusColor = (status: string) => {
  const colors = {
    submitted: 'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };
  return colors[status as keyof typeof colors] || colors.submitted;
};

export const getPriorityColor = (priority: string) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };
  return colors[priority as keyof typeof colors] || colors.low;
};

export const getCategoryIcon = (category: string) => {
  const icons = {
    pothole: '🕳️',
    streetlight: '💡',
    trash: '🗑️',
    graffiti: '🎨',
    traffic_sign: '🚦',
    water_leak: '💧',
    sidewalk: '🚶',
    noise: '🔊',
    other: '❓'
  };
  return icons[category as keyof typeof icons] || icons.other;
};