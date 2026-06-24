import { MapContainer, TileLayer, Polyline ,CircleMarker,Polygon, } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import * as h3 from "h3-js";
import { useState } from "react";

const routes: [number, number][][] = [
  [
    [26.5123, 80.2329],
    [26.5180, 80.2400],
    [26.5240, 80.2480],
  ],

  [
    [26.5100, 80.2280],
    [26.5160, 80.2380],
    [26.5220, 80.2550],
  ],

  [
    [26.5080, 80.2350],
    [26.5150, 80.2450],
    [26.5280, 80.2520],
  ],
];

  

const pickups: [number, number][] = [
  [26.514, 80.235],
  [26.519, 80.242],
  [26.521, 80.246],
  [26.528, 80.252],
];



const zone: [number, number][] = [
  [26.505, 80.225],
  [26.505, 80.260],
  [26.535, 80.260],
  [26.535, 80.225],
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

  const corridorCoords =
    corridor.geometry.coordinates[0].map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );

  


  const eligiblePickups = pickups.map((pickup) => {
    const point = turf.point([
      pickup[1], // lng
      pickup[0], // lat
    ]);

    return turf.booleanPointInPolygon(
      point,
      corridor
    );
    });

  const pickupCells = pickups.map(
    ([lat, lng]) =>
      h3.latLngToCell(lat, lng, 9)
    );

    console.log(pickupCells);

  return (
    <div>
    <button
      onClick={() =>
        setRouteIndex(
        (routeIndex + 1) % routes.length
        )
      }
      >
      Next Route
      </button>
    <MapContainer
      center={[26.5123, 80.2329]}
      zoom={13}
      style={{
        height: "100vh",
        width: "100vw",
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
    </MapContainer>
    </div>
  );

}

export default App;