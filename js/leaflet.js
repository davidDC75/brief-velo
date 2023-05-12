let circleRadius = 1500;
let circleColor = '#F59C00';
let circleFillColor = 'white';
let circleOpacity = 1;

let map = L.map('map').setView([50.237, 2.758], 8);

let circlesTbl = new Array();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// let circle = L.circle([50.237,2.758], {
//     color: circleColor,
//     fillColor: circleFillColor,
//     fillOpacity: circleOpacity,
//     radius: circleRadius
// }).addTo(map);

// circle.bindPopup('I am a circle');

let gpx = './js/trace-gpx.xml';

new L.GPX(gpx, {
        async: true,
        gpx_options: {
            joinTrackSegments: false
        },
        polyline_options: { // Couleur et épaisseur de la ligne des tracés
            color: '#F59C00',
            opacity: 0.75,
            weight: 3,
            lineCap: 'round'
        },
        marker_options: {
            shadowUrl: '',
            startIcon: new L.divIcon({
                html: '<div class="map-marker"></div>'            
            }),
            endIcon: new L.divIcon({
                html: '<div class="map-marker"></div>'            
            })
         
        }

    }).on('loaded', (e) => {
        map.fitBounds(e.target.getBounds());
    }).on('addpoint', (e) => {
        console.log('Added '+e.point_type+' point: '+e.point);
    })
    .addTo(map);