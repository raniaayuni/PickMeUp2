import Map from 'https://cdn.skypack.dev/ol/Map.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import { fromLonLat, toLonLat } from 'https://cdn.skypack.dev/ol/proj.js';
import Overlay from 'https://cdn.skypack.dev/ol/Overlay.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import Style from 'https://cdn.skypack.dev/ol/style/Style.js';
import Icon from 'https://cdn.skypack.dev/ol/style/Icon.js';

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

// Popup overlay
const popup = new Overlay({
    element: document.createElement('div'),
    positioning: 'top-center',
    stopEvent: false,
});
popup.getElement().className = 'popup';
map.addOverlay(popup);

// Vector source for markers
const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({ source: vectorSource });
map.addLayer(vectorLayer);

const info = document.getElementById('info');

// Click event to show location info and add marker
map.on('click', function (event) {
    const coordinates = toLonLat(event.coordinate);
    const lon = coordinates[0].toFixed(6);
    const lat = coordinates[1].toFixed(6);
    
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then(response => response.json())
        .then(data => {
            popup.getElement().innerHTML = `
                <div class="popup-content">
                    <strong>Location Info:</strong><br>
                    ${data.display_name}<br>
                    <strong>Coordinates:</strong> ${lat}, ${lon}
                </div>
            `;
            popup.setPosition(event.coordinate);
            
            // Add marker at clicked location
            const marker = new Feature({
                geometry: new Point(event.coordinate),
            });
            marker.setStyle(new Style({
                image: new Icon({
                    src: 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png',
                    scale: 0.9,
                })
            }));
            
            vectorSource.addFeature(marker); // Do not clear previous markers
            
            // Update info section
            info.innerHTML = `Coordinates: ${lat}, ${lon}`;
        })
        .catch(error => console.error('Error fetching location details:', error));
});

// Function to get current location and add marker
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const coordinates = fromLonLat([lon, lat]);
            map.getView().setCenter(coordinates);
            map.getView().setZoom(15);
           
            // Add marker for current location
            const marker = new Feature({
                geometry: new Point(coordinates),
            });
            marker.setStyle(new Style({
              image: new Icon({
                  src: 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png', 
                  scale: 0.9,
                  anchor: [0.5, 1],
              })
          }));          
            vectorSource.addFeature(marker);
            
            // Update location info
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                .then(response => response.json())
                .then(data => {
                    document.getElementById('locationInfo').innerHTML = `
                        Location: ${data.display_name}<br>
                        Coordinates: ${lat}, ${lon}
                    `;
                })
                .catch(error => console.error('Error fetching location details:', error));
        }, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

document.getElementById('getLocation').addEventListener('click', getCurrentLocation);

// Handle errors
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
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
