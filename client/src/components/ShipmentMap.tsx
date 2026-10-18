import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import type { GeoJsonObject } from "geojson";
import worldAtlas from "world-atlas/countries-110m.json";

/** Offline SVG world map (bundled TopoJSON, no network fetch at runtime) —
 * draws the origin-to-destination route with a pulsing marker at the
 * current simulated position. Straight-line interpolation, not a real
 * shipping route. */
export function ShipmentMap({
  originCoordinates,
  destinationCoordinates,
  currentPosition,
}: {
  originCoordinates: [number, number];
  destinationCoordinates: [number, number];
  currentPosition: [number, number];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-line/30 dark:bg-dark-line/30">
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 140 }} className="h-48 w-full">
        <Geographies geography={worldAtlas as unknown as GeoJsonObject}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                tabIndex={-1}
                className="fill-line stroke-card dark:fill-dark-line dark:stroke-dark-card"
                style={{ outline: "none" }}
              />
            ))
          }
        </Geographies>

        <Line
          from={originCoordinates}
          to={destinationCoordinates}
          className="stroke-line dark:stroke-dark-line"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="transparent"
        />
        <Line
          from={originCoordinates}
          to={currentPosition}
          className="stroke-forest dark:stroke-gold"
          strokeWidth={2}
          fill="transparent"
        />

        <Marker coordinates={originCoordinates}>
          <circle r={4} className="fill-forest stroke-card dark:fill-gold dark:stroke-dark-card" strokeWidth={1.5} />
        </Marker>
        <Marker coordinates={destinationCoordinates}>
          <circle r={4} className="fill-gold stroke-card dark:stroke-dark-card" strokeWidth={1.5} />
        </Marker>
        <Marker coordinates={currentPosition}>
          <motion.circle
            r={5}
            className="fill-forest stroke-card dark:fill-gold dark:stroke-dark-card"
            strokeWidth={1.5}
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </Marker>
      </ComposableMap>
    </div>
  );
}
