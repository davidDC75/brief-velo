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

// Partie haute contenant les liens du container de gauche
let containerTopleft = document.getElementById('partie-haute-container');
// Pour l'accueil de la partie gauche lorsqu'on arrive sur la page itinéraire
let containerListeEtape = document.getElementById('container-liste-etape');
// Le contenu html de la liste des étapes lorsqu'on arrive sur itineraire.html
let listeEtape = '';

// let image = document.getElementById("img")
let urlStrapi = 'http://90.110.218.245:5003'
let etapes = null
// let etapeSuivante = document.getElementById("etapeSuivante")
// let etapePrecedente = document.getElementById("etapePrecedente")
let next = null
let previous = null

// Chargement des données
fetch(urlStrapi+"/api/etapes?populate=*")
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
        // On affiche l'étape sur la carte
        etape.gpx = new L.GPX(urlStrapi + etape.attributes.gpx.data[0].attributes.url, {
            async: true,
            marker_options: {
                shadowUrl: '',
                shadowSize: [0,0],
                // On utilise des classes avec des div plutôt que des images
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
                // On déplace la carte pour la centrer sur l'étape
                map.fitBounds(e.target.getBounds());
                // Quand on clique sur une étape on met le tracé en vert
                e.target.setStyle({
                    color: '#07756d'
                })
                // On itinialise les flags à false pour éviter le mouseover sur le tracé
                // Car une étape a été sélectionnée
                mouseoverToggle = false
                mouseoutToggle = false
                // Si une track était déjà cliqué, on remet sa couleur à l'origine
                if (lastTrackClicked!=null) {
                    lastTrackClicked.setStyle({ color: '#f59c00' })
                }
                // On stocke la track sélectionné afin de pouvoir la récupèrer après un autre clique
                lastTrackClicked = e.target
                // On appelle afficheEtape, si on click sur le trajet d'une étape
                afficheEtape(etape);
            }).on('mouseover mousemove', function (e) {
                // Si on passe la souris sur le tracé, on change la couleur en vert
                if (mouseoverToggle == true) {
                    this.setStyle({
                        color: '#07756d'
                    });
                    // On calcule la distance en km et on arrondi à un chiffre après la virgule
                    distance=calculateDistance(e.target.get_distance());
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
        // On crée le html de la liste des étape pour l'étape correspondante
        populateListeEtape(etape,i);
        i++; // On incrémente le compteur
    }
    afficheTopLeftContainer();
    // On injecte la liste des étapes dans le container
    containerListeEtape.innerHTML=listeEtape;
    // On remet le compteur à zéro
    i=0;
}


// Converti une distance en km et arrondi à un chiffre après la virgule
function calculateDistance(distance) {
    distance=distance/1000;
    return distance.toFixed(1);
}

// Préparation de la liste des étapes
function populateListeEtape(etape,i) {
    // containerListeEtape;
    let image=urlStrapi+etape.attributes.image.data.attributes.url;
    let distance=etape.attributes.distance;
    let titre=etape.attributes.titre_texte;
    let villeDepart=etape.attributes.ville_depart;
    let villeArrive=etape.attributes.ville_arrive;
    let texte=etape.attributes.texte;
    texte=texte.substring(0,100)+' [...]';
    // On crée la liste des étapes une à une
    listeEtape = listeEtape +
    `<div class="etape-container" onclick="afficheEtape(${i});" id="etape-container-${i}">
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

// Appelé lorsque l'on clique sur la fléche qui permet de retourner à la liste des étapes
function retourneListeEtape() {
    afficheTopLeftContainer();
    // On injecte la liste des étapes dans le container
    containerListeEtape.innerHTML=listeEtape;
    // On remet la map à son origine
    map.setView([50.8, 2.6], 9);
    // On remet les flag à true pour gérer les mouseover et mouseout
    mouseoverToggle = true;
    mouseoutToggle = true;
    if (lastTrackClicked != null) {
        lastTrackClicked.setStyle({ color: '#f59c00' });
    }
    lastTrackClicked = null;
}

function afficheEtape(etape) {
    // Click venant de la partie gauche
    if (typeof etape=="number") { // Click depuis la liste à gauche, on récupère un index de tableau
        villeDepart = etapes[etape].attributes.ville_depart;
        villeArrive = etapes[etape].attributes.ville_arrive;
        texte = etapes[etape].attributes.texte;
        titre_texte = etapes[etape].attributes.titre_texte;
        image = etapes[etape].attributes.image.data.attributes.url;
        fichierGpx = etapes[etape].attributes.gpx.data[0].attributes.url;
        distance = etapes[etape].attributes.distance;
        // Ici on gère l'affichage du parcours sur la carte
        AfficheEtapeSurMap(etapes[etape]);

    } else { // Click venant de la carte, on récupère donc un objet
        villeDepart = etape.attributes.ville_depart;
        villeArrive = etape.attributes.ville_arrive;
        texte = etape.attributes.texte;
        titre_texte = etape.attributes.titre_texte;
        image = etape.attributes.image.data.attributes.url;
        fichierGpx = etape.attributes.gpx.data[0].attributes.url;
        distance = etape.attributes.distance;
    }

    containerTopleft.innerHTML=`
    <div class="top-etape-flex-column">
        <div class="top-etape-flex-row-1">
            <div class="top-etape-flex-row-2">
                <a href="#" onclick="retourneListeEtape()"><span class="material-symbols-outlined">arrow_back</span></a>
                <div class="top-etape-flex-column">
                    <span class="etape-desc-trajet">${villeDepart} &gt; ${villeArrive}</span>
                    <span class="etape-desc-veloeuro">Le Véloeuro</span>
                </div>
                <a href="#"><span class="top-etape-passeport">PASSEPORT 🗺️</span></a>
            </div>
        </div>
        <div class="top-etape-flex-row-3">
            <div class="lien-container lien-container-selected">
                <a href="#" class="onglet-menu onglet-menu-selected"><span class="onglet-menu-desc">description</span></a>
            </div>
            <div class="lien-container">
                <a href="#" class="onglet-menu"><span class="onglet-menu-avis">avis et témoignages</span></a>
            </div>
        </div>
    </div>
    `;

    etapeHTML=`
        <div class="etape-detail-container">
            <div class="etape-detail-top">
                <h2>${titre_texte}</h2>
            </div>
            <div class="etape-detail-flex-row">
                <span class="etape-distance">
                    ${distance} Km
                </span>
                <span class="etape-temps">
                 0 h 00 min
                 </span>
                 <span class="etape-difficulte">
                 </span>
            </div>
            <div class="etape-detail-image">
                <img src="${urlStrapi}${image}">
            </div>
            <div class="etape-detail-dep-arr-flex">
                <div class="etape-detail-ville-depart">${villeDepart}</div>
                <div><span class="material-symbols-outlined">swap_horiz</span></div>
                <div class="etape-detail-ville-arrive">${villeArrive}</div>
            </div>
            <div class="etape-detail-description">
                <p>${texte}</p>
            </div>
            <div class="etape-bottom-block-fixed">
                <div class="etape-detail-bottom-link">
                    CARNET DE VOYAGE
                    TRACE GPX
                    FICHE PDF
                </div>
                <div class="etape-detail-bottom-button">

                </div>
            </div>
        </div>
    `;
    // Le container de la liste des étapes sert aussi de container pour une description d'une étape
    containerListeEtape.innerHTML=etapeHTML;
}

function afficheTopLeftContainer() {
    containerTopleft.innerHTML=`<div class="etape-menu">
    <div class="lien-container lien-container-selected"><a href="#" class="onglet-menu onglet-menu-selected"><span class="onglet-menu-etapes">étapes</span></a></div>
    <div class="lien-container"><a href="#" class="onglet-menu"><span class="onglet-menu-boucles">boucles</span></a></div>
    <div class="lien-container"><a href="#" class="onglet-menu"><span class="onglet-menu-gps">mon gps</span></a></div>
</div>
<div class="planifier-itineraire">
    <p>Planifier un itinéraire sur cette véloroute</p>
    <div class="formulaire-itineraire">
        <select name="etape-depart" id="etape-depart">
            <option value="">Etape de départ</option>
        </select>
        <span class="swap-vert-icon material-symbols-outlined">swap_vert</span>
        <select name="etape-arrive" id="etape-arrive">
            <option value="">Etape d'arrivée</option>
        </select>
        <button>Planifier mon itinéraire</button>
    </div>
</div>
<div id="gpx-container">
    <a href="./gpx/trace-complet.gpx">Télécharger le .gpx de la vélodyssée</a>
</div>`;
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
function AfficheEtapeSurMap(etape) {
    // On centre la carte sur l'étape
    map.fitBounds(etape.gpx.getBounds());
    // On met le tracé en vert
    etape.gpx.setStyle({
        color: '#07756d'
    });
    // On met les flags à false pour ne pas gérer les mouseover et mouseout
    mouseoverToggle = false
    mouseoutToggle = false
    // Si une track été déjà cliqué alors on la remet à sa couleur d'origine
    if (lastTrackClicked != null) {
        lastTrackClicked.setStyle({ color: '#f59c00' })
    }
    // On stocke la dernière étape cliquée
    lastTrackClicked = etape.gpx;
}