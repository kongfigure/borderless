import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps";
import type { GeoJsonObject } from "geojson";
import worldAtlas from "world-atlas/countries-110m.json";
import { US_DESTINATION } from "@/lib/iconicProducts";

interface GeographyProperties {
  name?: string;
}

/** Offline SVG world map (bundled TopoJSON, no network fetch at runtime) —
 * highlights the origin country and draws a dashed line to the US. */
export function OriginMap({
  originCountryName,
  originCoordinates,
}: {
  originCountryName: string;
  originCoordinates: [number, number];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-line/30 dark:bg-dark-line/30">
      <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 140 }} className="h-48 w-full">
        <Geographies geography={worldAtlas as unknown as GeoJsonObject}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isOrigin = (geo.properties as GeographyProperties | undefined)?.name === originCountryName;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={-1}
                  className={
                    isOrigin
                      ? "fill-forest stroke-card dark:fill-gold dark:stroke-dark-card"
                      : "fill-line stroke-card dark:fill-dark-line dark:stroke-dark-card"
                  }
                  style={{ outline: "none" }}
                />
              );
            })
          }
        </Geographies>
        <Line
          from={originCoordinates}
          to={US_DESTINATION.coordinates}
          className="stroke-gold"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill="transparent"
        />
        <Marker coordinates={originCoordinates}>
          <circle r={4} className="fill-forest stroke-card dark:fill-gold dark:stroke-dark-card" strokeWidth={1.5} />
        </Marker>
        <Marker coordinates={US_DESTINATION.coordinates}>
          <circle r={4} className="fill-gold stroke-card dark:stroke-dark-card" strokeWidth={1.5} />
        </Marker>
      </ComposableMap>
    </div>
  );
}
