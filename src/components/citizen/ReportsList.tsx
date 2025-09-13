import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { getReports } from "../../lib/storage";
import { useAuth } from "../../contexts/AuthContext";
import {
  formatDate,
  getStatusColor,
  getPriorityColor,
  getCategoryIcon,
} from "../../lib/utils";
import { MapPin, Volume2, Video } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Report } from "../../types";

// Fix Leaflet marker issue
const DefaultIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

export const ReportsList: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReports = () => {
      const userReports = getReports(user.id);
      setReports(userReports);
      setLoading(false);
    };

    fetchReports();

    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
          <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-20 w-full bg-gray-100 rounded"></div>
        </div>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <div className="text-center py-10">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reports yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by submitting your first civic issue report.
          </p>
          <a
            href="/report"
            className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Report
          </a>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <Card key={report.id} padding="sm">
          <div className="flex flex-col space-y-4">
            {/* Top Info */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(report.category)}</span>
                  <h3 className="font-medium text-gray-900">{report.title}</h3>
                </div>

                <p
                  className="text-sm text-gray-600 mb-3 line-clamp-2"
                  title={report.description}
                >
                  {report.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority.toUpperCase()}
                  </span>

                  {/* Enhanced Audio */}
                  {report.audio_url && (
                    <div className="flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 border rounded-lg px-3 py-2 shadow-sm">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                      <audio
                        controls
                        src={report.audio_url}
                        className="w-40 sm:w-64 focus:outline-none"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  {/* Video Badge */}
                  {report.video_url && (
                    <span className="flex items-center text-xs text-gray-500">
                      <Video className="w-3 h-3 mr-1" /> Video
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{report.address.substring(0, 30)}...</span>
                  </div>
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Side by side: Photo + Map */}
            {(report.photo_url || (report.latitude && report.longitude)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {/* Photo */}
                {report.photo_url && (
                  <div className="rounded-lg overflow-hidden shadow">
                    <img
                      src={report.photo_url}
                      alt="Report"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Map */}
                {report.latitude && report.longitude && (
                  <div className="h-48 rounded-lg overflow-hidden shadow">
                    <MapContainer
                      center={[report.latitude, report.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[report.latitude, report.longitude]}>
                        <Popup>
                          <strong>{report.title}</strong>
                          <br />
                          {report.address}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
