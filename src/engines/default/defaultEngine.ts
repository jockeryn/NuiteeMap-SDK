import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import RoutingService from "../../services/routingService";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  MapEngine,
  MapOptions,
  GeoJSON,
  Coordinates,
} from "../../types/MapEngine";
import createDomElement from "../../utils/createDomElement";

const defaultSettings: MapOptions = {
  zoom: 10,
  center: { lat: 51.50076763943303, lng: -0.12461437233456225 },
  showMarkerControls: true,
  style: "mapbox://styles/mapbox/standard", // change style based on the map engine,
  enableDrawTools: false,
  show3DToggle: true,
  showToggleStyle: true,
};

export class defaultEngine implements MapEngine {
  private map!: mapboxgl.Map;
  private markers: mapboxgl.Marker[] = [];
  private addMarkerOnceActive = false;
  private activateRouteFinder = false;
  private routeLayerId = 'route'; 
  private customToolsContainer: HTMLElement | null;


  //for directions feature
  private routingService!: RoutingService; // ID for the route layer

  constructor(accessToken: string) {
    mapboxgl.accessToken = accessToken;
    this.customToolsContainer = null;
  }

  private generateCustomToolsContainer(): HTMLElement {
    const customToolsContainer = createDomElement("div", {
      className: "mapboxgl-ctrl mapboxgl-ctrl-group",
    });
    const customToolsSection = createDomElement(
      "div",
      { className: "mapboxgl-ctrl-top-right mapboxgl-ctrl-custom-tools" },
      customToolsContainer
    );
    const toolsContainer = document.querySelector(
      ".mapboxgl-control-container"
    );
    if (toolsContainer) {
      toolsContainer.appendChild(customToolsSection);
    }
    return customToolsContainer;
  }

  private addAddMarkerButton(): void {
    const button = createDomElement("button", {
      className: "mapboxgl-ctrl-icon mapboxgl-ctrl-add-marker tooltip",
      ariaLabel: "Add marker on next click",
      title: "Add marker on next click",
    });
    button.innerHTML = "<span class='tooltiptext'>Add a single mark to the map</span>"
    // Attach click event to enable one-time add marker mode
    button.onclick = () => {
      button.classList.toggle("active");
      this.enableOneTimeAddMarker();
    }
    this.customToolsContainer?.appendChild(button);
  }

  private add3DToggleButton(): void {
    const button = createDomElement("button", {
      className: "mapboxgl-ctrl-icon mapboxgl-ctrl-3dtoggle tooltip",
      ariaLabel: "See 3D view",
      title: "See 3D view",
    });
    button.innerHTML = "<span class='tooltiptext'>Change to 3D view</span>"
    // Attach click event to enable one-time add marker mode
    button.onclick = () => this.changeTo3DView();
    this.customToolsContainer?.appendChild(button);
  }

  private addToggleStyleButton(): void {
    const button = createDomElement("button", {
      className: "mapboxgl-ctrl-icon mapboxgl-ctrl-mapstyle",
      ariaLabel: "Layers",
      title: "Layers",
    });

    const layersContainer = createDomElement("div", {
      className: "mapboxgl-ctrl-layers",
    });
    layersContainer.innerHTML = `
        <ul>
            <li data-layer="standard">Standard 3D</li>
            <li data-layer="standard-satellite">Satellite</li>
            <li data-layer="streets-v12">Streets</li>
            <li data-layer="outdoors-v12">Outdoors</li>
            <li data-layer="light-v11">Light</li>
            <li data-layer="dark-v11">Dark</li>
        </ul>
        `;
    layersContainer.addEventListener("click", (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === "LI") {
        const layer = target.getAttribute("data-layer");
        this.map.setStyle(`mapbox://styles/mapbox/${layer}`);
      }
    });
    layersContainer?.appendChild(button);
    this.customToolsContainer?.appendChild(layersContainer);
  }

  private handleToggleRouteFinder() {
    this.activateRouteFinder = !this.activateRouteFinder;
    if (this.activateRouteFinder) {
        this.map.on("click", this.handleMapClick.bind(this));
    } else {
        this.resetMarkers(); 
        this.map.off("click", this.handleMapClick.bind(this));
    }
  }

  private addRouteFinderButton(): void {
    const button = createDomElement("button", {
      className: "mapboxgl-ctrl-icon mapboxgl-ctrl-directions tooltip",
      ariaLabel: "Get directions between two points",
    });
    button.innerHTML = "<span class='tooltiptext'>Get directions between two points, just click on the map</span>"

    // Attach click event to enable one-time add marker mode
    button.onclick = () => {
      button.classList.toggle("active");
      this.handleToggleRouteFinder();
    } 

    this.customToolsContainer?.appendChild(button);
  }

  private handleMapClick(event: mapboxgl.MapMouseEvent) {
    if (!this.activateRouteFinder) return;

    const coordinates = event.lngLat;

    if (this.markers.length >= 2) {
        this.resetMarkers();
    }

    this.addMarker(coordinates, "");

    // If two markers exist, fetch directions
    if (this.markers.length === 2) {
        const start = this.markers[0].getLngLat().toArray();
        const end = this.markers[1].getLngLat().toArray();
        this.routingService.fetchDirections(start, end);
    }
}


  private enableOneTimeAddMarker(): void {
    this.addMarkerOnceActive = true;

    // Set a one-time click event listener on the map
    const handleClick = (event: mapboxgl.MapMouseEvent) => {
      if (this.addMarkerOnceActive) {
        const { lng, lat } = event.lngLat;
        this.addMarker({ lng, lat }, `${[lng, lat]}`);
        this.addMarkerOnceActive = false; // Disable the mode after one marker is added
        this.map.off("click", handleClick); // Remove the listener
      }
    };

    // Add the click listener
    this.map.on("click", handleClick);
  }

  private changeTo3DView(): void {
    if (this.map.getPitch() === 0) {
      this.map.setPitch(60);
      this.map.setBearing(0);
    } else {
      this.map.setPitch(0);
      this.map.setBearing(0);
    }
  }

  private addSearchBox(): void {
    // using the Mapbox Geocoder API @mapbox/mapbox-gl-geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl, // Link Geocoder to the map
      marker: false, // Disable automatic marker to avoid duplicates
      placeholder: "Search for places...", // Placeholder text
    });

    // Add the geocoder to the map
    this.map.addControl(geocoder, "top-left");

    // Optional: Add marker on search result
    geocoder.on(
      "result",
      (
        event: mapboxgl.MapEvent & {
          result: {
            geometry: { coordinates: [number, number] };
            place_name: string;
          };
        }
      ) => {
        const coordinates = event.result.geometry.coordinates;
        this.addMarker(
          { lat: coordinates[1], lng: coordinates[0] },
          event.result.place_name
        );
      }
    );
  }
  private loadTools(options: MapOptions): void {
    // declaring routing service
    this.routingService = new RoutingService(this.map);

    // Load marker controls
    this.customToolsContainer = this.generateCustomToolsContainer();
    // Add search box and directions always active
    this.addSearchBox();
    this.addRouteFinderButton();
      this.routingService = new RoutingService(this.map);

    const tools = [
      {
        condition: options.showMarkerControls,
        method: this.addAddMarkerButton.bind(this),
      },
      {
        condition: options.show3DToggle,
        method: this.add3DToggleButton.bind(this),
      },
      {
        condition: options.showToggleStyle,
        method: this.addToggleStyleButton.bind(this),
      },
    ];

    tools.forEach((tool) => {
      if (tool.condition) tool.method();
    });
  }

  

  private resetMarkers() {
    // Clear all markers from the map
    this.markers.forEach(marker => marker.remove());
    this.markers = []; // Reset the markers array

    // Remove the route layer if it exists
    if (this.map.getLayer(this.routeLayerId)) {
        this.map.removeLayer(this.routeLayerId);
        this.map.removeSource(this.routeLayerId); // Remove the source if necessary
    }
}

  addMarker(coordinates: Coordinates, label: string): void {
    // Create the marker
    const marker = new mapboxgl.Marker()
      .setLngLat([coordinates.lng, coordinates.lat])
      .addTo(this.map);

    // Create the popup with the remove button
    const popupContent = createDomElement("div", { className: "marker-popup" });
    popupContent.innerHTML = `
            ${label} 
            <button class="remove-marker-btn"></button>
        `;

    // Add the popup to the marker
    const popup = new mapboxgl.Popup()
      .setDOMContent(popupContent)
      .setMaxWidth("200px");

    marker.setPopup(popup);

    // Store marker reference
    this.markers.push(marker);

    // Event listener for the remove button
    popupContent
      .querySelector(".remove-marker-btn")
      ?.addEventListener("click", () => {
        // Remove marker from the map
        marker.remove();

        // Remove marker from the array
        this.markers = this.markers.filter((m) => m !== marker);
      });
  }

  removeMarker(marker: mapboxgl.Marker): void {
    marker.remove();
  }

  clearAllMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];
  }

  setView({ center, zoom }: { center: GeoJSON; zoom: number }): void {
    const lngLat: Coordinates = center;
    const label: string = center.label ? center.label : "";
    this.map.flyTo({ center: lngLat, zoom });
    this.addMarker(lngLat, label);
  }

  getCenter(): Coordinates {
    const center = this.map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }

  getViewBounds(): mapboxgl.LngLatBounds | null {
    return this.map?.getBounds() || 0;
  }

  getRadius(bounds: mapboxgl.LngLatBounds): number {
    if (!bounds) return 0;
    // Calculate the radius (approximate) using the distance between the corners
    const radius = bounds.getNorthEast().distanceTo(bounds.getSouthWest()) / 2;
    return radius;
  }

  // Main initialization function (Point 1 in the task)
  initializeMap(container: HTMLElement, options: MapOptions): mapboxgl.Map {
    // Merge default settings with the provided options
    const mapOptions: MapOptions = { ...defaultSettings, ...options.options };
    this.map = new mapboxgl.Map({
      container,
      style: mapOptions.style || "mapbox://styles/mapbox/streets-v11",
      center: [mapOptions.center.lng, mapOptions.center.lat],
      zoom: mapOptions.zoom,
    });
    // Add navigation control (Point 2 in the task)
    const navControl = new mapboxgl.NavigationControl();
    this.map.addControl(navControl, "top-right");

    // Load tools
    this.loadTools(mapOptions);
    // We return the map instance so it can be used by the caller
    return this.map;
  }
}
