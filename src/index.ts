
import { MapController } from './controllers/mapController'; // Import the MapController

// Function to initialize the map and display hotels
export function nuiteeMap(container: HTMLElement, options: any) {
    const mapController = new MapController({
        mapEngineApiKey: options.mapEngineApiKey,
        nuiteeApiKey: options.nuiteeApiKey,
        weatherApiKey: options.weatherMapApiKey
    });
    
    // Initialize the map
    mapController.init(container, options);
    return mapController
}
