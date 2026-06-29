import { MapContainer, TileLayer, Polyline, CircleMarker, Polygon, } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import * as h3 from "h3-js";
import { useState } from "react";

const routes: [number, number][][] = [
  [
    [28.6328, 77.2197], // Connaught Place
    [28.6265, 77.2295],
    [28.6205, 77.2380],
  ],

  [
    [28.6400, 77.2100],
    [28.6320, 77.2220],
    [28.6240, 77.2360],
  ],

  [
    [28.6180, 77.2050],
    [28.6230, 77.2210],
    [28.6310, 77.2400],
  ],
];



const pickups: [number, number][] = [
  [28.6290, 77.2230],
  [28.6260, 77.2310],
  [28.6210, 77.2390],
  [28.6370, 77.2140],
];



const zone: [number, number][] = [
  [28.6100, 77.1950],
  [28.6100, 77.2500],
  [28.6450, 77.2500],
  [28.6450, 77.1950],
];

function App() {
  const [routeIndex, setRouteIndex] = useState(0);

  const route = routes[routeIndex];

  const line = turf.lineString(
    route.map(([lat, lng]) => [lng, lat])
  );

  const corridor = turf.buffer(line, 0.35, {
    units: "kilometers",
  });

  if (!corridor) {
    return <div>Failed to generate corridor.</div>;
  }


  const corridorCoords =
    corridor.geometry.coordinates[0].map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

  const corridorCells = h3.polygonToCells(
    corridor.geometry.coordinates as any,
    9,
    true
  );

  const corridorCellSet = new Set(corridorCells);

  const hexagons = corridorCells.map((cell) =>
    h3.cellToBoundary(cell, true)
  );



  const eligiblePickups = pickups.map((pickup) => {
    const pickupCell = h3.latLngToCell(
      pickup[0],
      pickup[1],
      9
    );

    return corridorCellSet.has(pickupCell);
  });

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100%",
      }}
    >
      <h1
        style={{
          position: "absolute",
          top: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          margin: 0,
          color: "black",
          fontSize: "30px",
          fontWeight: "700",
          letterSpacing: "1px",
          textShadow: "0 2px 8px rgba(70, 70, 70, 0.6)",
          pointerEvents: "none",
        }}
      >
        Macro Rides
      </h1>
      <button
        onClick={() =>
          setRouteIndex(
            (routeIndex + 1) % routes.length
          )
        }
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          padding: "10px 18px",
          border: "none",
          borderRadius: "8px",
          background: "#2E7D32",
          color: "white",
          cursor: "pointer",
        }}
      >
        Next Route
      </button>

      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          background: "white",
          padding: "6px 10px",
          borderRadius: "10px",
          width: "100px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          fontSize: "11px",
        }}
      >
        <div><b>🚗 Route:</b> {routeIndex + 1}</div>
        <div><b>⬡ H3 Cells:</b> {corridorCells.length}</div>
        <div>
          <b>📍 Eligible:</b>{" "}
          {eligiblePickups.filter(Boolean).length}/{pickups.length}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "130px",
          left: "20px",
          zIndex: 1000,
          background: "white",
          padding: "6px 8px",
          borderRadius: "10px",
          width: "150px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          fontSize: "13px",
        }}
      >
        <h4>Legend</h4>

        <div>🔴 Driver Route</div>
        <div>🟩 350m Corridor</div>
        <div>🟪 H3 Cells</div>
        <div>🟢 Eligible Pickup</div>
        <div>⚫ Ineligible Pickup</div>
        <div>🔵 Zone Boundary</div>
      </div>
      <MapContainer
        center={[28.6286, 77.2295]}
        zoom={13}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={zone}
          pathOptions={{
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.05,
            weight: 2,
          }}
        />

        <Polyline
          positions={route}
          pathOptions={{
            color: "red",
            weight: 5,
          }}
        />
        {pickups.map((p, idx) => (
          <CircleMarker
            key={idx}
            center={p}
            radius={6}
            pathOptions={{
              color: eligiblePickups[idx]
                ? "green"
                : "gray",

              fillColor: eligiblePickups[idx]
                ? "green"
                : "gray",

              fillOpacity: 1,
            }}
          />
        ))}
        <Polygon
          positions={corridorCoords}
          pathOptions={{
            color: "green",
            fillColor: "green",
            fillOpacity: 0.3,
          }}
        />
        {hexagons.map((hex, idx) => (
          <Polygon
            key={idx}
            positions={hex.map(([lng, lat]) => [lat, lng])}
            pathOptions={{
              color: "purple",
              weight: 1,
              fillOpacity: 0.1,
            }}
          />
        ))}

      </MapContainer>
    </div>
  );

}

export default App;