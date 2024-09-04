import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const highlightedCountries = [
  { name: "India", coordinates: [78.9629, 20.5937] },
  { name: "Denmark", coordinates: [10.4515, 56.2639] },
  { name: "Ghana", coordinates: [-1.0232, 7.9465] },
];

const WorldMapAdmin = () => {
  return (
    <ComposableMap>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography key={geo.rsmKey} geography={geo} />
          ))
        }
      </Geographies>
      {highlightedCountries.map(({ name, coordinates }) => (
        <Marker key={name} coordinates={coordinates}>
          <circle r={10} fill="#F53" />
        </Marker>
      ))}
    </ComposableMap>
  );
};

export default WorldMapAdmin;