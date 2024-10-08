import { nuiteeMap } from '../src';

/* 
It should come from an environment variable or a secure place, but for the sake of simplicity, we are using a hardcoded value here.
Now it is a Mapbox access token, but it can be any other map provider's access token like Leaflet or even a Nuitee API key that provides access to the engines.
*/
const MAPENGINE_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN' 
const NUITEE_API_KEY = 'YOUR_NUITEE_API_KEY'
const WEATHERMAP_API_KEY = 'YOUR_WEATHERMAP_API_KEY'
// Get the map container
const $mapContainer = document.getElementById('map');
// Set the center of the map
const center = {
    lat: 51.50076763943303,
    lng: -0.12461437233456225,
    label: 'Westminster, London'
};

// Initialize the map
const myMap = nuiteeMap(
    $mapContainer, 
    {
        mapEngineApiKey: MAPENGINE_ACCESS_TOKEN, // again for this exercise we pass this mapbox token, for a real integration it can be served through a .env file in a secure place
        nuiteeApiKey: NUITEE_API_KEY,
        weatherMapApiKey: WEATHERMAP_API_KEY,
        options: {
            center,
            zoom: 16,
            showMarkerControls: true,
            style: 'mapbox://styles/mapbox/standard'
        }
    }
);

// Add a marker to the map
// myMap.map.addMarker({
//     lat: 51.50076763943303,
//     lng: -0.12461437233456225,
//     label: "This is a example label"
// });

// Show hotels in the current area
// myMap.showHotels({
//     bookingOptions: {
//         checkin: '2022-01-01',
//         checkout: '2022-01-02',
//         adults: 2,
//         children: 0
//     }
// })

// Iterate default nav buttons to navigate the map
const navButtons = document.querySelectorAll('.nav-btn');
const zoom = 14
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const { lat, lng, label } = JSON.parse(button.dataset.geojson);
        // Calling map method to navigate to specific location
        myMap.map.setView({
            center: { lat: parseFloat(lat), lng: parseFloat(lng), label },
            zoom: parseInt(zoom)
        });
    });
});
