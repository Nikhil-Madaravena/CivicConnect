import type { User, Report, Analytics } from "../types";

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "citizen@example.com",
    role: "citizen",
    full_name: "John Citizen",
    phone: "+1-555-0123",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    email: "admin@example.com",
    role: "admin",
    full_name: "Admin User",
    phone: "+1-555-0456",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// Mock reports
export const mockReports: Report[] = [
  {
    id: "1",
    title: "Large pothole on Main Street",
    description:
      "There is a significant pothole near the intersection of Main St and Oak Ave that poses a danger to vehicles.",
    category: "pothole",
    priority: "high",
    status: "in_progress",
    lat: 40.7128,
    lng: -74.006,
    address: "123 Main Street, Downtown",
    photo_url:
      "https://images.pexels.com/photos/163016/highway-the-way-forward-road-marking-163016.jpeg?auto=compress&cs=tinysrgb&w=400",
    audio_url:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // mock audio
    citizen_id: "1",
    assigned_department: "public_works",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:20:00Z",
  },
  {
    id: "2",
    title: "Broken streetlight",
    description:
      "The streetlight at the corner of Elm Street has been out for several days, making the area unsafe at night.",
    category: "streetlight",
    priority: "medium",
    status: "acknowledged",
    lat: 40.7589,
    lng: -73.9851,
    address: "456 Elm Street, Midtown",
    citizen_id: "1",
    assigned_department: "utilities",
    created_at: "2024-01-14T16:45:00Z",
    updated_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "3",
    title: "Overflowing trash bin",
    description:
      "The public trash bin in Central Park is overflowing and attracting pests.",
    category: "trash",
    priority: "medium",
    status: "resolved",
    lat: 40.7829,
    lng: -73.9654,
    address: "Central Park, Near Playground",
    photo_url:
      "https://images.pexels.com/photos/2827392/pexels-photo-2827392.jpeg?auto=compress&cs=tinysrgb&w=400",
    video_url:
      "https://www.w3schools.com/html/mov_bbb.mp4", // mock video
    citizen_id: "1",
    assigned_department: "sanitation",
    created_at: "2024-01-12T08:20:00Z",
    updated_at: "2024-01-13T11:30:00Z",
  },
];

export const mockAnalytics: Analytics = {
  totalReports: 15,
  resolvedReports: 8,
  averageResponseTime: 2.3,
  reportsByCategory: {
    pothole: 5,
    streetlight: 3,
    trash: 4,
    graffiti: 1,
    traffic_sign: 1,
    water_leak: 1,
    sidewalk: 0,
    noise: 0,
    other: 0,
  },
  reportsByStatus: {
    submitted: 3,
    acknowledged: 2,
    in_progress: 2,
    resolved: 6,
    closed: 2,
  },
  reportsByPriority: {
    low: 4,
    medium: 7,
    high: 3,
    urgent: 1,
  },
};
