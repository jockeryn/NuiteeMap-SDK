// src/services/RoutingService.ts
import mapboxgl from "mapbox-gl";

export default class RoutingService {
  private map: mapboxgl.Map;
  private routeLayerId = "route"; // ID for the route layer

  constructor(map: mapboxgl.Map) {
    this.map = map;
  }

  async fetchDirections(start: [number, number], end: [number, number]) {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(
        ","
      )};${end.join(",")}?geometries=geojson&access_token=${
        mapboxgl.accessToken
      }`
    );

    if (!response.ok) {
      console.error("Error fetching directions:", response.statusText);
      return;
    }

    const data = await response.json();
    this.displayRoute(data.routes[0].geometry.coordinates);
  }

  displayRoute(coordinates: [number, number][]) {
    // Check if the layer already exists and remove it if necessary
    if (this.map.getLayer(this.routeLayerId)) {
      this.map.removeLayer(this.routeLayerId);
    }

    // Check if the source already exists and remove it if necessary
    if (this.map.getSource(this.routeLayerId)) {
      this.map.removeSource(this.routeLayerId);
    }

    this.map.addLayer({
      id: this.routeLayerId,
      type: "line",
      source: {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
        },
      },
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 4,
      },
    });
  }
}
