import { MapEngine } from '../types/MapEngine';
import { defaultEngine } from '../engines/default/defaultEngine';
import '../assets/css/styles.scss';
import { Coordinates, NuiteCoordinates } from '../types/MapEngine';
import createDomElement from '../utils/createDomElement';
import Nuitee from '../services/nuiteeService';
import WeatherService from '../services/weatherService'; 

export class MapController {
    private map: MapEngine;
    private service: Nuitee;
    private weatherService: WeatherService;
    private bookingOptions: any;

    constructor({mapEngineApiKey, nuiteeApiKey, weatherApiKey}: {mapEngineApiKey: string, nuiteeApiKey: string, weatherApiKey: string}) {
        this.map = new defaultEngine(mapEngineApiKey);
        this.service = new Nuitee(nuiteeApiKey);
        this.weatherService = new WeatherService(weatherApiKey);
    }

    private renderHotels(hotels: any[]) {
        hotels.forEach((hotel: any) => {
            const coordinates = {lng: hotel.longitude, lat: hotel.latitude};
            const label = this.generateHotelInfo(hotel);
            this.map.addMarker(coordinates, label);
        });
    }

    private generateHotelInfo(hotel: {name: string, address: string, main_photo: string, longitude: number, latitude: number, rating: number}) {
        return `
            <div class="hotel-info-popup">
                <h3>${hotel.name}</h3>
                <img src="${hotel.main_photo}" alt="${hotel.name}" />
                <p>${hotel.address}</p>
                <p>${hotel.rating}</p>
            </div>`       
    }

    private showHotelsBtnHandler(container: HTMLElement) {
        if(document.querySelector('#show-hotels-btn')) return;
        const showHotelsBtn = createDomElement('button', { id: 'show-hotels-btn', innerText: 'Show Hotels in this area' })
        if (showHotelsBtn) {
            showHotelsBtn.addEventListener('click', async () => {
                showHotelsBtn.innerText = 'Loading...';
                const newCoordinates: Coordinates = this.map.getCenter();
                await this.showHotels({coordinates: newCoordinates})
                showHotelsBtn.innerHTML = 'Show Hotels in this area';

            });
        }
        showHotelsBtn && container.appendChild(showHotelsBtn);
    }

    private showWeatherBtnHandler(container: HTMLElement) {
        if(document.querySelector('#show-weather-btn')) return;
        const showWeatherBtn = createDomElement('button', { id: 'show-weather-btn', innerText: 'What to do' })
        if (showWeatherBtn) {
            showWeatherBtn.addEventListener('click', async () => {
                showWeatherBtn.innerText = 'Loading...';
                const newCoordinates: Coordinates = this.map.getCenter();
                await this.showWeatherRecommendations(newCoordinates)
                showWeatherBtn.innerHTML = 'What to do';
            });
        }
        showWeatherBtn && container.appendChild(showWeatherBtn);
    }

    async showWeatherRecommendations(coordinates: Coordinates): Promise<String[]|void>{
        const weatherData = await this.weatherService.getWeather(coordinates.lat, coordinates.lng);

        if (weatherData) {
            // Generate recommendations based on the weather
            const mainWeather = weatherData.weather[0].main; // e.g., "Clear", "Rain", etc.
            const recommendations = this.getRecommendations(mainWeather);

            // Display recommendations on the map, maybe in a popup or sidebar
            this.displayRecommendations({recommendations, city: weatherData.name, temp: weatherData.main.temp, icon: weatherData.weather[0].icon, mainWeather});
            return recommendations
        }
    }

    private getRecommendations(weatherCondition: string): string[] {
        switch (weatherCondition) {
            case 'Clear':
                return ['Great day for hiking!', 'Visit the nearest park!'];
            case 'Rain':
                return ['How about visiting a museum?', 'Check out local cafes!'];
            case 'Snow':
                return ['Perfect for skiing!', 'Try snowboarding nearby!'];
            default:
                return ['Explore local attractions!'];
        }
    }

    private displayRecommendations({recommendations, city, temp, icon, mainWeather}: {recommendations: string[], city: string, temp: number, icon: string, mainWeather: string}) {
        const recommendationDialog = createDomElement('dialog', { className: 'recommendation-container', open: 'true' }) as HTMLDialogElement;;
        

        const recommendationElement = createDomElement('div', { className: 'recommendation-item' });
        recommendationElement.innerHTML = `
            <p>Today at ${city} is ${mainWeather}, ${recommendations.join(' or ')}.</p>
            <img src="http://openweathermap.org/img/w/${icon}.png" alt="Weather Icon" />
            <span>Temp: ${temp}°C</span>
        `;
        recommendationDialog.appendChild(recommendationElement);
        const closeButton = createDomElement('button', { innerText: 'Close' });
        closeButton.onclick = () => recommendationDialog.close();
        recommendationDialog.appendChild(closeButton);

        document.body.appendChild(recommendationDialog);
    }

    getMap(): MapEngine {
        return this.map;
    }

    async showHotels({coordinates, bookingOptions}: {coordinates?: Coordinates | null, bookingOptions?: {checkin: string, checkout: string, adults: number, children: number}}): Promise<void> {
        if (!coordinates) {
            coordinates = this.map.getCenter();
        }
        if(bookingOptions) {
            this.bookingOptions = bookingOptions;
        }
        const bounds = this.map.getViewBounds()
        const radius = this.map.getRadius(bounds)
        const serviceCoorinates: NuiteCoordinates = {latitude: coordinates.lat, longitude: coordinates.lng, radius}

        if (!this.bookingOptions || !this.bookingOptions.checkin || !this.bookingOptions.checkout || this.bookingOptions.adults === undefined || this.bookingOptions.children === undefined) {
            console.error('Missing required hotel search booking options, please provide checkin, checkout, adults, and children, showing default hotels');
        }
        
        const hotels = await this.service.fetchHotels({...serviceCoorinates, ...this.bookingOptions});
        this.map.clearAllMarkers()
        this.renderHotels(hotels.data)
    }
    
    init(container: HTMLElement, options: any) {
        this.map.initializeMap(container, options);
        this.showHotelsBtnHandler(container)
        this.showWeatherBtnHandler(container)
    }
}
