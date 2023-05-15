// Création carte
var map = L.map('map').setView([50.8, 2.6], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Déclaration variables
let mouseoverToggle = true
let mouseoutToggle = true
let lastTrackClicked = null


// Pour l'accueil de la partie gauche lorsqu'on arrive sur la page itinéraire
let containerListeEtape = document.getElementById('container-liste-etape');
let listeEtape = '';


// let titreEtape = document.getElementById("titreEtape")
// let texteEtape = document.getElementById("texteEtape")
// let montee = document.getElementById("montee")
// let descente = document.getElementById("descente")
// let distance = document.getElementById("distance")
// let gpxDownload = document.getElementById("gpxDownload")
// let image = document.getElementById("img")
let urlStrapi = 'http://90.110.218.245:5003'
let etapes = null
// let etapeSuivante = document.getElementById("etapeSuivante")
// let etapePrecedente = document.getElementById("etapePrecedente")
let next = null
let previous = null

// Chargement des données
fetch( urlStrapi + "/api/etapes?populate=*")
    .then(function (res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function (value) {
        etapes = value.data
        drawMap(etapes)
        // clicSuivant()
        // clicPrecedent()
    })
    .catch(function (err) {
        //Une erreur est survenue
    });

// Création des tracés et fonctions de clics
function drawMap(etapes) {
    // Flag qui permet de mettre le départ et l'arrivé du tracé complet dans une autre couleur et ataille
    let isFirst = null
    let isLast = null
    // Compteur pour le dessin des étapes
    let i = 0;
    // Boucle qui va dessiner les tracers gpx correspondant à chaque étape et préparer les événements
    for (let etape of etapes) {
        // On met les flags à jour
        isFirst = (i == 0)
        isLast = (i == etapes.length - 1)
        etape.gpx = new L.GPX(urlStrapi + etape.attributes.gpx.data[0].attributes.url, {
            async: true,
            marker_options: {
                shadowUrl: '',
                shadowSize: [0,0],
                startIcon: new L.divIcon({
                    html: (isFirst)?'<div class="start-map-marker"></div>':'<div class="map-marker"></div>'
                }),
                endIcon: new L.divIcon({
                    html: (isLast)?'<div class="end-map-marker"></div>':'<div class="map-marker"></div>'
                })
            },
            etape: etape,
            polyline_options: {
                color: '#f59c00',
                opacity: 1,
                weight: 5,
                lineCap: 'round'
            },
        }).addTo(map)
            .on('click', function (e) {
                map.fitBounds(e.target.getBounds());
                // Quand on clique sur une étape on met le tracé en vert
                e.target.setStyle({
                    color: '#07756d'
                })
                // On itinialise les flags
                mouseoverToggle = false
                mouseoutToggle = false
                // Si une track était déjà cliqué, on remet sa couleur à l'origine
                if (lastTrackClicked != null) {
                    lastTrackClicked.setStyle({ color: '#f59c00' })
                }
                // On stocke la track sélectionné afin de pouvoir la récupèrer avec un autre clique
                lastTrackClicked = e.target
                // On prépare les textes correspondant à l'étape
                //populateEtape(etape);
            }).on('mouseover mousemove', function (e) {
                // Si on passe la souris sur le tracé, on change la couleur en vert
                if (mouseoverToggle == true) {
                    this.setStyle({
                        color: '#07756d'
                    });
                    // On calcule la distance en km et on arrondi à un chiffre après la virgule
                    distance=e.target.get_distance()/1000;
                    distance=distance.toFixed(1);
                    // On ouvre une popup qui va afficher des informations sur l'étape
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(etape.attributes.ville_depart + " -> " + etape.attributes.ville_arrive +"<br>" + distance + "km")
                        .openOn(map)
                }
            }).on('mouseout', function () {
                // quand on sort du tracé, on remet la couleur en orange
                if (mouseoutToggle == true) {
                    map.closePopup();
                    this.setStyle({
                        color: '#f59c00'
                    })
                }
            });
        populateListeEtape(etape,i);
        i++; // On incrémente le compteur
    }
    // const bouton = document.getElementById("bouton");
    // bouton.addEventListener('click', function () {
    //     reset()
    // })

    // On injecte la liste des étapes dans le container
    containerListeEtape.innerHTML=listeEtape;
    // On remet le compteur à zéro
    i=0;
    // On gère les événements hover
    for (etape of etapes) {
        let div=document.getElementById('etape-container-'+i);
        div.addEventListener('hover', () => {
            console.log("test");
        })
        i++;
    }
}


// Préparation de la liste des étapes
function populateListeEtape(etape,i) {
    console.log('dans populateListeEtape');
    // containerListeEtape;
    let image=urlStrapi+etape.attributes.image.data.attributes.url;
    let distance=etape.attributes.distance;
    let titre=etape.attributes.titre_texte;
    let villeDepart=etape.attributes.ville_depart;
    let villeArrive=etape.attributes.ville_arrive;
    let texte=etape.attributes.texte;
    texte=texte.substring(0,10)+' [...]';
    // On crée la liste des étapes une à une
    listeEtape = listeEtape + 
    `<div class="etape-container" id="etape-container-${i}">
    <div class="image-etape-container">
        <img src="${image}" class="image-etape">
        <span class="distance-etape">${distance} km</span>
    </div>
    <div class="etape-content-container">
        <h2>${titre}</h2>
        <span>${villeDepart} &gt; ${villeArrive}</span>
        <p>${texte}</p>
    </div>
</div>`;

}

// Retour au tracé complet
function reset() {
    map.setView([50.8, 2.6], 9);
    mouseoutToggle = true;
    mouseoverToggle = true;
    if (lastTrackClicked != null) {
        lastTrackClicked.setStyle({ color: '#f59c00' });
    }
    titreEtape.innerHTML = "Eurovélo - Hauts de france";
    distance.innerHTML = "217,4km";
    montee.innerHTML = "1090m";
    descente.innerHTML = "1071m";
    texteEtape.innerHTML = "Les Hauts-de-France sont une région administrative du nord de la France, créée par la réforme territoriale de 2014. Résultat de la fusion du Nord-Pas-de-Calais et de la Picardie (elles-mêmes créées en 1972), elle s'est d'abord appelée provisoirement Nord-Pas-de-Calais-Picardie\
    Elle s\'étend sur 31 806 km2 et compte cinq départements : l\'Aisne, le Nord, l\'Oise, le Pas-de-Calais et la Somme. Elle est présidée par Xavier Bertrand depuis le 4 janvier 2016 et son chef-lieu est Lille, principale ville de la région et auparavant déjà chef-lieu du Nord-Pas-de-Calais. Amiens, chef-lieu de l\'ancienne Picardie, est la deuxième ville de la région.\
    La région est limitrophe de l\'Île-de-France située au sud, de la Normandie à l\'ouest et du Grand Est à l\'est. De plus, elle est frontalière de la Belgique sur toute sa partie nord-est, et est bordée par la Manche et la mer du Nord, à l\'ouest et au nord\
    Située au cœur de l\'Europe, avec 6 004 947 habitants en 2019, et une densité de population de 189 hab/km2, elle représente la 3e région la plus peuplée de France et la 2e la plus densément peuplée de France métropolitaine après l\'Île - de - France. ";
    image.src = "images/etapes/imageetape9.jpg";
    gpxDownload.href = "js/fulltrack.gpx";
    setButtonNext(false)
    setButtonPrevious(false)
}


// Génération boutons précedent/suivant
function setButtons() {
    if (lastTrackClicked == null) {
        return;
    }
    if (etapes[etapes.length - 1].attributes.etapeId != lastTrackClicked.options.etape.attributes.etapeId) {
        setButtonNext(true)
    } else {
        setButtonNext(false)
    }
    if (etapes[0].attributes.etapeId != lastTrackClicked.options.etape.attributes.etapeId) {
        setButtonPrevious(true)
    } else {
        setButtonPrevious(false)
    }
}

function setButtonNext(visible) {
    if (visible == true) {
        etapeSuivante.style.visibility = "visible"
    } else {
        etapeSuivante.style.visibility = "hidden"
    }
}

function setButtonPrevious(visible) {
    etapePrecedente.style.visibility = (visible == true) ? "visible" : "hidden";
}

// Fonctions des boutons précedent/suivant
function clicSuivant() {
    etapeSuivante.addEventListener('click', event => {
        event.preventDefault()
        nextTrack();
    });
}

function clicPrecedent() {
    etapePrecedente.addEventListener('click', event => {
        event.preventDefault()
        previousTrack();
    });
}

function nextTrack() {
    let i = 0
    for (let etape of etapes) {
        if (etape.attributes.etapeId == lastTrackClicked.options.etape.attributes.etapeId) {
            next = etapes[i + 1]
            trackChange(next)
            return;
        }
        i++
    }
}

function previousTrack() {
    let i = 0
    for (let etape of etapes) {
        if (etape.attributes.etapeId == lastTrackClicked.options.etape.attributes.etapeId) {
            previous = etapes[i - 1]
            trackChange(previous)
            return;
        }
        i++
    }
}

// Clic des boutons
function trackChange(x) {
    map.fitBounds(x.gpx.getBounds());
    x.gpx.setStyle({
        color: '#07756d'
    })
    mouseoverToggle = false
    mouseoutToggle = false
    if (lastTrackClicked != null) {
        lastTrackClicked.setStyle({ color: '#f59c00' })
    }
    setArticle(x)
    lastTrackClicked = x.gpx
    setButtons()
}