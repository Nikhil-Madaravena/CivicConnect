import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Card } from "../ui/Card";
import { Camera, MapPin, Send, Mic, StopCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { addReport, uploadImage } from "../../lib/storage";
import type { ReportCategory } from "../../types";

const categories: { value: ReportCategory; label: string }[] = [
  { value: "pothole", label: "🕳️ Pothole" },
  { value: "streetlight", label: "💡 Streetlight Issue" },
  { value: "trash", label: "🗑️ Trash/Sanitation" },
  { value: "graffiti", label: "🎨 Graffiti" },
  { value: "traffic_sign", label: "🚦 Traffic Sign" },
  { value: "water_leak", label: "💧 Water Leak" },
  { value: "sidewalk", label: "🚶 Sidewalk Issue" },
  { value: "noise", label: "🔊 Noise Complaint" },
  { value: "other", label: "❓ Other" },
];

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ReportFormProps {
  onSubmit: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ReportCategory>("other");

  // Photo
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  // Audio recording
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  // Location
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const address = await fetchAddress(latitude, longitude);
          setLocation({ lat: latitude, lng: longitude, address });
        },
        () => {
          setError("Unable to fetch current location. Please select on map.");
        }
      );
    }
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Map click handler
  const LocationPicker = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const address = await fetchAddress(lat, lng);
        setLocation({ lat, lng, address });
      },
    });
    return null;
  };

  // ✅ MapUpdater to move map when location changes
  const MapUpdater: React.FC<{ location: { lat: number; lng: number } | null }> = ({ location }) => {
    const map = useMapEvents({});
    useEffect(() => {
      if (location) {
        map.flyTo([location.lat, location.lng], 16);
      }
    }, [location, map]);
    return null;
  };

  // 🎤 Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      setError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !location) {
      setError("Please login and select a location before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let photoUrl = null;
      if (photo) photoUrl = await uploadImage(photo);

      let audioUrlUploaded = null;
      if (audioBlob) {
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        audioUrlUploaded = await uploadImage(audioFile);
      }

      await addReport({
        title,
        description,
        category,
        priority: "medium",
        status: "submitted",
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        photo_url: photoUrl,
        audio_url: audioUrlUploaded,
        citizen_id: user.id,
      });

      // Reset
      setTitle("");
      setDescription("");
      setCategory("other");
      setPhoto(null);
      setPhotoPreview("");
      setAudioBlob(null);
      setAudioUrl("");
      setLocation(null);

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Report an Issue</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 📷 Camera First Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo / Camera</label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Capture / Upload</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-lg border" />}
        </div>

        {/* 🎤 Voice Recording Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Voice Note (Optional)</label>
          <div className="flex items-center space-x-3">
            {!recording ? (
              <Button type="button" onClick={startRecording} variant="outline">
                <Mic className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button type="button" onClick={stopRecording} variant="destructive">
                <StopCircle className="w-4 h-4 mr-2" /> Stop
              </Button>
            )}
            {audioUrl && (
              <audio controls className="mt-2">
                <source src={audioUrl} type="audio/webm" />
              </audio>
            )}
          </div>
        </div>

        {/* 📝 Title & Description */}
        <Input label="Issue Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief description of the issue" required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Provide more details about the issue"
            required
          />
        </div>

        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)} options={categories} />

        {/* 🗺️ Map Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="h-64 rounded-lg overflow-hidden border">
            <MapContainer
              center={location ? [location.lat, location.lng] : [20.5937, 78.9629]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker />
              <MapUpdater location={location} />
              {location && <Marker position={[location.lat, location.lng]}><Popup>{location.address}</Popup></Marker>}
            </MapContainer>
          </div>
          {location && <p className="text-sm text-gray-600 mt-2">📍 {location.address}</p>}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <Button type="submit" className="w-full" disabled={loading || !location}>
          {loading ? "Submitting..." : (<><Send className="w-4 h-4 mr-2" /> Submit Report</>)}
        </Button>
      </form>
    </Card>
  );
};
