let circleRadius = 1500;
let circleColor = '#F59C00';
let circleFillColor = 'white';
let circleOpacity = 1;

let map = L.map('map').setView([50.237, 2.758], 8);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// L.marker([50.237, 2.758]).addTo(map)
//     .bindPopup('A pretty CSS popup.<br> Easily customizable.')
//     .openPopup();

let circle = L.circle([50.237,2.758], {
    color: circleColor,
    fillColor: circleFillColor,
    fillOpacity: circleOpacity,
    radius: circleRadius
}).addTo(map);

circle.bindPopup('I am a circle');