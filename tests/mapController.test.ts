import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MapController } from '../src/controllers/mapController';
import { defaultEngine } from '../src/engines/default/defaultEngine';
import WeatherService from '../src/services/weatherService';
import Nuitee from '../src/services/nuiteeService';

vi.mock('../services/weatherService');
vi.mock('../services/nuiteeService');

vi.mock('../engines/default/defaultEngine', () => {
    return {
        defaultEngine: vi.fn().mockImplementation(() => {
            return {
                getBounds: vi.fn().mockReturnValue({
                    getNorthEast: () => ({ lat: 51.5, lng: -0.12 }),
                    getSouthWest: () => ({ lat: 51.0, lng: -0.15 }),
                }),
                addMarker: vi.fn(),
            };
        }),
    };
});

describe('MapController Tests', () => {
    let mapController: MapController

    beforeEach(() => {
        const options = {
            mapEngineApiKey: 'testMapApiKey',
            nuiteeApiKey: 'testNuiteeApiKey',
            weatherApiKey: 'testWeatherApiKey'
        };
        mapController = new MapController(options);
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize map correctly', () => {
        expect(mapController).toBeDefined();
        expect(mapController.getMap()).toBeTruthy();
    });

    it('should fetch weather data', async () => {
        const mockWeatherData = { weather: [{ main: 'Clear' }], main: { temp: 25 }, name: 'Test City' };
        WeatherService.prototype.getWeather = vi.fn().mockResolvedValue(mockWeatherData);

        const recommendations = await mapController.showWeatherRecommendations({ lat: 51.5, lng: -0.12 });
        expect(recommendations).toContain('Great day for hiking!');
    });

    it('should fetch hotels correctly', async () => {
        const mockHotelsData = { data: [{ name: 'Hotel Test', latitude: 51.5, longitude: -0.12 }] };
        const thisMap = mapController.getMap()
        const spyAddMarker = vi.spyOn(thisMap, 'addMarker')
        Nuitee.prototype.fetchHotels = vi.fn().mockResolvedValue(mockHotelsData);
        await mapController.showHotels({ coordinates: { lat: 51.5, lng: -0.12 } });
        expect(spyAddMarker).toHaveBeenCalled();
    });

});
