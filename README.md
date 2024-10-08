
### Summary

This README provides a comprehensive guide for users to understand how to integrate your SDK into their applications. Make sure to replace placeholder texts like API keys and contact information with your actual data before publishing. If you have any more questions or need further assistance, feel free to ask!

## Disclaimer

This SDK is developed solely for technical test purposes and is not an official SDK for Nuitee. It is intended to showcase the capabilities of integrating mapping functionalities and is not representative of any official product or service offered by Nuitee. Please use it for demonstration and educational purposes only.


# Nuitee Map SDK

The Nuitee Map SDK provides a powerful and flexible way to integrate interactive mapping capabilities into your web applications. This SDK supports multiple map engines (including Mapbox), displays hotel information, and incorporates weather-based recommendations.

## Features

- **Multiple Map Engine Support**: Currently supports Mapbox, with the flexibility to add other engines in the future.
- **Marker Controls**: Easily add and remove markers on the map.
- **Route Finder**: Mark two points on the map and fetch directions between them.
- **Weather-Based Recommendations**: Get recommendations based on the current weather.
- **Hotel Data Fetching**: Retrieve and display nearby hotels based on user-defined criteria.

## Installation

To install the Nuitee Map SDK, use npm:

```bash
npm install nuiteemap-sdk
```

## Usage

Here's how to integrate the Nuitee Map SDK into your project:

### Step 1: Import the SDK

In your JavaScript or TypeScript file, import the `nuiteeMap` function from the SDK:

```javascript
import { nuiteeMap } from 'nuiteemap-sdk';
```

### Step 2: Set Up Your Map

Create a container in your HTML where the map will be displayed:

```html
<div id="map" style="width: 100%; height: 500px;"></div>
```

### Step 4: Initialize the Map

Use the nuiteeMap function to initialize your map. You need to provide your Mapbox access token, Nuitee API key, and weather map API key.

```javascript
const MAPENGINE_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; 
const NUITEE_API_KEY = 'YOUR_NUITEE_API_KEY';
const WEATHERMAP_API_KEY = 'YOUR_WEATHERMAP_API_KEY';

// Get the map container
const $mapContainer = document.getElementById('map');

// Set the center of the map
const center = {
    lat: 51.50076763943303,
    lng: -0.12461437233456225,
};

// Initialize the map
const myMap = nuiteeMap(
    $mapContainer, 
    {
        mapEngineApiKey: MAPENGINE_ACCESS_TOKEN,
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
```

### Run demo
```bash
npm run dev
```
### Run tests
```bash
npm test
```
