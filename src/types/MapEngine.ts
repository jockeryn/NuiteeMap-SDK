export interface MapEngine {
    initializeMap(container: HTMLElement, options: MapOptions): mapboxgl.Map,
    addMarker(coordinates: Coordinates, label: string): void,
    removeMarker(marker: any): void,
    setView({center, zoom}: {center: Coordinates, zoom: number}): void,
    getViewBounds(): mapboxgl.LngLatBounds,
    getRadius(bounds:mapboxgl.LngLatBounds): number,
    getCenter(): Coordinates,
    clearAllMarkers(): void
}

export interface MapOptions {
    center: Coordinates,
    zoom: number,
    style?: string,
    showMarkerControls: boolean,
    enableDrawTools: boolean,
    show3DToggle: boolean,
    showToggleStyle: boolean,
    [key: string]: any // Allow for additional properties
}

export interface Coordinates {
    lat: number,
    lng: number
}

export interface GeoJSON extends Coordinates {
    label?: string
}

export interface NuiteCoordinates {
    latitude: number,
    longitude: number,
    radius?: number
}