import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { getReports, updateReport } from '../../lib/storage';
import { formatDate, getStatusColor, getPriorityColor, getCategoryIcon } from '../../lib/utils';
import { Search, MapPin, Calendar } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Report, ReportStatus, Department } from '../../types';

// Fix Leaflet default icon issue
const DefaultIcon = L.icon({
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
L.Marker.prototype.options.icon = DefaultIcon;

// Fly to marker on map
const FlyToMarker: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

export const ReportsManager: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);

  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, searchTerm, statusFilter, departmentFilter]);

  const fetchReports = () => {
    const allReports = getReports();
    setReports(allReports);
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = reports;
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) filtered = filtered.filter((r) => r.status === statusFilter);
    if (departmentFilter) filtered = filtered.filter((r) => r.assigned_department === departmentFilter);
    setFilteredReports(filtered);
  };

  const updateReportStatus = (reportId: string, newStatus: ReportStatus, department?: Department) => {
    const updateData: any = { status: newStatus, updated_at: new Date().toISOString() };
    if (department) updateData.assigned_department = department;
    const updatedReport = updateReport(reportId, updateData);
    if (updatedReport) fetchReports();
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-6">
      {/* Map */}
      <div className="lg:w-2/3 w-full mb-4 lg:mb-0">
        <Card className="h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports Map</h3>
          <MapContainer
            center={[reports[0]?.latitude || 0, reports[0]?.longitude || 0]}
            zoom={13}
            style={{ height: '60vh', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredReports.map((report) =>
              report.latitude && report.longitude ? (
                <Marker
                  key={report.id}
                  position={[report.latitude, report.longitude]}
                  eventHandlers={{
                    click: () => setSelectedPosition([report.latitude!, report.longitude!]),
                  }}
                >
                  <Popup>
                    <strong>{report.title}</strong>
                    <br />
                    {report.address}
                  </Popup>
                </Marker>
              ) : null
            )}
            <FlyToMarker position={selectedPosition} />
          </MapContainer>
        </Card>
      </div>

      {/* Cards */}
      <div className="lg:w-1/3 w-full space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {/* Filters */}
        <Card>
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'submitted', label: 'Submitted' },
                  { value: 'acknowledged', label: 'Acknowledged' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                  { value: 'closed', label: 'Closed' },
                ]}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'public_works', label: 'Public Works' },
                  { value: 'sanitation', label: 'Sanitation' },
                  { value: 'traffic', label: 'Traffic' },
                  { value: 'utilities', label: 'Utilities' },
                  { value: 'parks', label: 'Parks & Recreation' },
                  { value: 'planning', label: 'Planning' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Reports */}
        {filteredReports.map((report) => (
          <Card key={report.id} padding="sm" className="hover:shadow-lg transition-shadow">
            <div className="space-y-2">
              {/* Image */}
              {report.photo_url && (
                <img
                  src={report.photo_url}
                  alt={report.title}
                  className="w-full h-40 object-cover rounded-md border border-gray-200"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getCategoryIcon(report.category)}</span>
                  <h3 className="font-medium text-gray-900">{report.title}</h3>
                </div>
                <div className="flex space-x-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      report.priority
                    )}`}
                  >
                    {report.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3">{report.description}</p>

              {report.audio_url && (
                <div className="mt-1">
                  <audio controls className="w-full rounded">
                    <source src={report.audio_url} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span>{report.address.substring(0, 25)}...</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(report.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReportStatus(report.id, 'acknowledged')}
                  disabled={report.status !== 'submitted'}
                >
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReportStatus(report.id, 'in_progress', 'public_works')}
                  disabled={report.status === 'resolved' || report.status === 'closed'}
                >
                  In Progress
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => updateReportStatus(report.id, 'resolved')}
                  disabled={report.status === 'resolved' || report.status === 'closed'}
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setSelectedPosition(report.latitude && report.longitude ? [report.latitude, report.longitude] : null)
                  }
                >
                  Locate on Map
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    if (report.latitude && report.longitude) {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  Directions
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
