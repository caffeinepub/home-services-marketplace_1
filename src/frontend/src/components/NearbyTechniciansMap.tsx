import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { MapPin, Navigation } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { ProfessionalInfo } from "../backend.d";
import { ServiceCategory } from "../backend.d";

// Fix default icon
const DefaultIcon = L.icon({
  iconUrl: iconUrl as string,
  shadowUrl: iconShadow as string,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Orange icon for technicians
const TechIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:oklch(0.65 0.20 45);border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

// Blue icon for user
const UserIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:oklch(0.55 0.18 240);border:3px solid white;border-radius:50%;box-shadow:0 2px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const categoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.laptopRepair]: "Laptop Repair",
  [ServiceCategory.desktopRepair]: "Desktop Repair",
  [ServiceCategory.networkSetup]: "Network Setup",
  [ServiceCategory.dataRecovery]: "Data Recovery",
  [ServiceCategory.accessoriesSales]: "Accessories Sales",
  [ServiceCategory.computerSales]: "Computer Sales",
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export interface NearbyTechniciansMapProps {
  userLat: number | null;
  userLng: number | null;
  technicians: ProfessionalInfo[];
  onBookNow?: () => void;
}

export function NearbyTechniciansMap({
  userLat,
  userLng,
  technicians,
  onBookNow,
}: NearbyTechniciansMapProps) {
  // Default to center of India if no location
  const centerLat = userLat ?? 20.5937;
  const centerLng = userLng ?? 78.9629;
  const defaultZoom = userLat ? 12 : 5;

  const techsWithDistance = useMemo(() => {
    return technicians
      .filter((t) => t.latitude != null && t.longitude != null)
      .map((t) => ({
        ...t,
        distKm:
          userLat != null && userLng != null
            ? haversineKm(userLat, userLng, t.latitude!, t.longitude!)
            : null,
      }))
      .sort(
        (a, b) =>
          (a.distKm ?? Number.POSITIVE_INFINITY) -
          (b.distKm ?? Number.POSITIVE_INFINITY),
      );
  }, [technicians, userLat, userLng]);

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
      data-ocid="map.canvas_target"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userLat != null && userLng != null && (
        <>
          <RecenterMap lat={userLat} lng={userLng} />
          <Circle
            center={[userLat, userLng]}
            radius={5000}
            pathOptions={{
              color: "oklch(0.55 0.18 240)",
              fillColor: "oklch(0.80 0.10 240)",
              fillOpacity: 0.12,
              weight: 1.5,
            }}
          />
          <Marker position={[userLat, userLng]} icon={UserIcon}>
            <Popup>
              <div className="text-center">
                <div className="font-bold text-sm flex items-center gap-1 justify-center">
                  <Navigation className="w-3.5 h-3.5" /> You are here
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {userLat.toFixed(4)}, {userLng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        </>
      )}
      {techsWithDistance.map((tech, i) => (
        <Marker
          key={tech.principal.toString()}
          position={[tech.latitude!, tech.longitude!]}
          icon={TechIcon}
          data-ocid={`map.technician.item.${i + 1}`}
        >
          <Popup>
            <div className="min-w-[180px] space-y-2">
              <div className="font-bold text-sm">{tech.displayName}</div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700 font-medium">
                  {categoryLabels[tech.category] ?? tech.category}
                </span>
              </div>
              {tech.distKm != null && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tech.distKm < 1
                    ? `${Math.round(tech.distKm * 1000)} m away`
                    : `${tech.distKm.toFixed(1)} km away`}
                </div>
              )}
              {onBookNow && (
                <button
                  type="button"
                  onClick={onBookNow}
                  data-ocid="map.book_now.primary_button"
                  className="w-full mt-1 px-3 py-1.5 text-xs font-semibold text-white rounded-md"
                  style={{ background: "oklch(0.55 0.18 240)" }}
                >
                  Book Now
                </button>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export { haversineKm, categoryLabels };
