export interface User {
  id: string;
  email: string;
  role: "citizen" | "admin";
  full_name?: string;
  phone?: string;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  priority: Priority;
  status: ReportStatus;
  lat: number; // changed from latitude
  lng: number; // changed from longitude
  address: string;
  photo_url?: string;
  audio_url?: string;
  video_url?: string;
  citizen_id: string;
  assigned_department?: Department;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  citizen?: User;
}

export type ReportCategory =
  | "pothole"
  | "streetlight"
  | "trash"
  | "graffiti"
  | "traffic_sign"
  | "water_leak"
  | "sidewalk"
  | "noise"
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export type ReportStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "closed";

export type Department =
  | "public_works"
  | "sanitation"
  | "traffic"
  | "utilities"
  | "parks"
  | "planning";

export interface StatusUpdate {
  id: string;
  report_id: string;
  message: string;
  status: ReportStatus;
  created_by: string;
  created_at: string;
  user?: User;
}

export interface Analytics {
  totalReports: number;
  resolvedReports: number;
  averageResponseTime: number; // in hours or minutes depending on backend
  reportsByCategory: Record<ReportCategory, number>;
  reportsByStatus: Record<ReportStatus, number>;
  reportsByPriority: Record<Priority, number>;
}
