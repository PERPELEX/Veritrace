"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { HeatMapPoint } from "@/lib/dashboard-types";

type Props = {
  points: HeatMapPoint[];
};

type LocationHint = {
  key: string;
  lat: number;
  lng: number;
};

const locationHints: LocationHint[] = [
  { key: "pakistan", lat: 30.3753, lng: 69.3451 },
  { key: "islamabad", lat: 33.6844, lng: 73.0479 },
  { key: "lahore", lat: 31.5204, lng: 74.3587 },
  { key: "karachi", lat: 24.8607, lng: 67.0011 },
  { key: "india", lat: 20.5937, lng: 78.9629 },
  { key: "delhi", lat: 28.6139, lng: 77.209 },
  { key: "mumbai", lat: 19.076, lng: 72.8777 },
  { key: "bangladesh", lat: 23.685, lng: 90.3563 },
  { key: "dhaka", lat: 23.8103, lng: 90.4125 },
  { key: "usa", lat: 39.8283, lng: -98.5795 },
  { key: "united states", lat: 39.8283, lng: -98.5795 },
  { key: "new york", lat: 40.7128, lng: -74.006 },
  { key: "uk", lat: 55.3781, lng: -3.436 },
  { key: "united kingdom", lat: 55.3781, lng: -3.436 },
  { key: "london", lat: 51.5072, lng: -0.1276 },
  { key: "uae", lat: 23.4241, lng: 53.8478 },
  { key: "dubai", lat: 25.2048, lng: 55.2708 },
  { key: "saudi", lat: 23.8859, lng: 45.0792 },
  { key: "riyadh", lat: 24.7136, lng: 46.6753 },
  { key: "canada", lat: 56.1304, lng: -106.3468 },
  { key: "toronto", lat: 43.6532, lng: -79.3832 },
  { key: "australia", lat: -25.2744, lng: 133.7751 },
  { key: "sydney", lat: -33.8688, lng: 151.2093 },
  { key: "germany", lat: 51.1657, lng: 10.4515 },
  { key: "berlin", lat: 52.52, lng: 13.405 },
  { key: "france", lat: 46.2276, lng: 2.2137 },
  { key: "paris", lat: 48.8566, lng: 2.3522 },
  { key: "japan", lat: 36.2048, lng: 138.2529 },
  { key: "tokyo", lat: 35.6762, lng: 139.6503 },
  { key: "china", lat: 35.8617, lng: 104.1954 },
  { key: "beijing", lat: 39.9042, lng: 116.4074 },
  { key: "indonesia", lat: -0.7893, lng: 113.9213 },
  { key: "jakarta", lat: -6.2088, lng: 106.8456 },
  { key: "malaysia", lat: 4.2105, lng: 101.9758 },
  { key: "kuala lumpur", lat: 3.139, lng: 101.6869 },
  { key: "singapore", lat: 1.3521, lng: 103.8198 },
  { key: "philippines", lat: 12.8797, lng: 121.774 },
  { key: "manila", lat: 14.5995, lng: 120.9842 },
  { key: "turkey", lat: 38.9637, lng: 35.2433 },
  { key: "istanbul", lat: 41.0082, lng: 28.9784 },
  { key: "egypt", lat: 26.8206, lng: 30.8025 },
  { key: "cairo", lat: 30.0444, lng: 31.2357 },
  { key: "nigeria", lat: 9.082, lng: 8.6753 },
  { key: "lagos", lat: 6.5244, lng: 3.3792 },
  { key: "brazil", lat: -14.235, lng: -51.9253 },
  { key: "sao paulo", lat: -23.5505, lng: -46.6333 },
  { key: "mexico", lat: 23.6345, lng: -102.5528 },
  { key: "mexico city", lat: 19.4326, lng: -99.1332 },
  { key: "spain", lat: 40.4637, lng: -3.7492 },
  { key: "madrid", lat: 40.4168, lng: -3.7038 },
  { key: "italy", lat: 41.8719, lng: 12.5674 },
  { key: "rome", lat: 41.9028, lng: 12.4964 },
  { key: "russia", lat: 61.524, lng: 105.3188 },
  { key: "moscow", lat: 55.7558, lng: 37.6173 },
];

function resolveCoordinates(location: string) {
  const normalized = location.toLowerCase();
  const matched = locationHints.find((hint) => normalized.includes(hint.key));
  return matched ? { lat: matched.lat, lng: matched.lng } : null;
}

function getLevelColor(level: HeatMapPoint["level"]) {
  if (level === "high") {
    return "#ef4444";
  }
  if (level === "medium") {
    return "#f59e0b";
  }
  return "#2f7f76";
}

function getRadius(tweets: number, maxTweets: number) {
  if (maxTweets <= 0) {
    return 6;
  }
  const ratio = tweets / maxTweets;
  return Math.max(6, Math.min(22, Math.round(6 + ratio * 16)));
}

function formatCompact(n: number) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

export function OverviewLocationMap({ points }: Props) {
  const plottedPoints = points
    .map((point) => {
      const coords = resolveCoordinates(point.location);
      if (!coords) {
        return null;
      }

      return {
        ...point,
        ...coords,
      };
    })
    .filter((point): point is HeatMapPoint & { lat: number; lng: number } => point !== null);

  const maxTweets = Math.max(0, ...plottedPoints.map((point) => point.tweets));
  const unresolvedCount = Math.max(0, points.length - plottedPoints.length);

  return (
    <div>
      <div className="h-[320px] w-full overflow-hidden rounded-xl border border-slate-200">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={1}
          maxZoom={7}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {plottedPoints.map((point) => (
            <CircleMarker
              key={`${point.location}-${point.lat}-${point.lng}`}
              center={[point.lat, point.lng]}
              radius={getRadius(point.tweets, maxTweets)}
              pathOptions={{
                color: "#ffffff",
                weight: 1,
                fillColor: getLevelColor(point.level),
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{point.location}</p>
                  <p>{formatCompact(point.tweets)} tweets</p>
                  <p className="capitalize">{point.level} intensity</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-600">
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#2f7f76]" /> Low</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f59e0b]" /> Medium</span>
        <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#ef4444]" /> High</span>
        {unresolvedCount > 0 ? <span>{unresolvedCount} location(s) not mapped yet</span> : null}
      </div>
    </div>
  );
}
