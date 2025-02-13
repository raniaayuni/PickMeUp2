import Map from 'https://cdn.skypack.dev/ol/Map.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import { fromLonLat, toLonLat } from 'https://cdn.skypack.dev/ol/proj.js';

// Create the map
const map = new Map({
    target: 'map',
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
    }),
});

// Add click event listener to display coordinates
const info = document.getElementById('info');
map.on('click', function (event) {
    const coordinates = toLonLat(event.coordinate);
    const lon = coordinates[0].toFixed(6);
    const lat = coordinates[1].toFixed(6);
    info.innerHTML = `Longitude: ${lon}, Latitude: ${lat}`;
});

// Function to get current location
document.getElementById('getLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Show position and fetch location details
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const coordinates = fromLonLat([lon, lat]);
    map.getView().setCenter(coordinates);
    map.getView().setZoom(15); // Zoom in to the user's location

    // Fetch location details using Nominatim API
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(response => response.json())
        .then(data => {
            const locationInfo = document.getElementById('locationInfo');
            locationInfo.innerHTML = `Location: ${data.display_name}`;
        })
        .catch(error => {
            console.error('Error fetching location details:', error);
        });
}

// Handle errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User  denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}