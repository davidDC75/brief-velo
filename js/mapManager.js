// Création carte
var map = L.map('map').setView([50.8, 2.6], 9);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '<a href="./index.html">Eurovélo 5</a>'
}).addTo(map);


// Ces deux flags vont permettre de gérer le changement de couleur d'un tracé de la carte
// Lorsqu'on passe dessus
// Il est désactivé quand on click sur un tracé ou une étape de la liste
let mouseoverToggle=true;
let mouseoutToggle=true;
// Permet de stocker le dernier tracé sélectionné
let lastTrackClicked=null;

let containerLeftSide=document.getElementById('left-side-container');
// Partie haute contenant les liens du container de gauche
let containerTopleft=document.getElementById('partie-haute-container');
// Pour l'accueil de la partie gauche lorsqu'on arrive sur la page itinéraire
let containerListeEtape=document.getElementById('container-liste-etape');
// Le contenu html de la liste des étapes lorsqu'on arrive sur itineraire.html
let listeEtape='';
// L'url de strapi
let urlStrapi='http://85.169.220.243:5003';
// La liste des étapes récupéré dans strapi
let etapes=null;
// Nombre d'étapes
let nbEtapes=0;


// Chargement des données
fetch(urlStrapi+"/api/etapes?populate=*")
    .then(function (res) {
        if (res.ok) {
            return res.json();
        }
    })
    .then(function (value) {
        etapes = value.data
        drawMap(etapes);
    })
    .catch(function (err) {
        console.log('Erreur en récupérant la liste des étapes.');
    });

// Création des tracés et fonctions de clics
function drawMap(etapes) {
    // Flag qui permet de mettre le départ et l'arrivé du tracé complet dans une autre couleur et taille
    let isFirst = null;
    let isLast = null;
    // Compteur pour le dessin des étapes
    let i = 0;
    // Boucle qui va dessiner les tracers gpx correspondant à chaque étape et préparer les événements
    for (let etape of etapes) {
        // On met les flags à jour
        isFirst=(i==0);
        isLast=(i==etapes.length-1);
        // On stocke l'index de l'étape
        etape.index=i;
        // On affiche l'étape sur la carte
        etape.gpx = new L.GPX(urlStrapi + etape.attributes.gpx.data[0].attributes.url, {
            async: true,
            marker_options: {
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
                // On stocke la track sélectionnée afin de pouvoir la récupèrer après un autre clique
                lastTrackClicked = e.target;
                // On appelle afficheEtape pour affiché l'étape
                afficheEtape(etape);
            }).on('mouseover mousemove', function (e) {
                // Si on passe la souris sur le tracé, on change la couleur en vert
                if (mouseoverToggle==true) {
                    this.setStyle({
                        color: '#07756d'
                    });
                    // On calcule la distance en km et on arrondi à un chiffre après la virgule
                    distance=calculateDistance(e.target.get_distance());
                    // On ouvre une popup qui va afficher des informations sur l'étape
                    L.popup()
                        .setLatLng(e.latlng)
                        .setContent(etape.attributes.ville_depart + " -> " + etape.attributes.ville_arrive +"<br>" + distance + "km")
                        .openOn(map);
                }
            }).on('mouseout', function () {
                // quand on sort du tracé, on remet la couleur en orange
                if (mouseoutToggle==true) {
                    map.closePopup();
                    this.setStyle({
                        color: '#f59c00'
                    });
                }
            });
        // On crée le html de la liste des étape pour l'étape correspondante
        populateListeEtape(etape,i);
        i++; // On incrémente le compteur
    }
    afficheTopLeftContainer();
    // On injecte la liste des étapes dans le container
    containerListeEtape.innerHTML=listeEtape;
    // On stocke le nombre d'étapes
    nbEtapes=i;
    // On remet le compteur à zéro
    i=0;
}


// Converti une distance en km et arrondi à un chiffre après la virgule
function calculateDistance(distance) {
    distance=distance/1000;
    return distance.toFixed(1);
}

// Le block du haut de la liste des étapes
function afficheTopLeftContainer() {
    containerTopleft.innerHTML=`
    <div class="etape-menu">
        <div class="lien-container lien-container-selected">
            <a href="#" class="onglet-menu onglet-menu-selected"><span class="onglet-menu-etapes">étapes</span></a>
        </div>
        <div class="lien-container">
            <a href="#" class="onglet-menu">
                <span class="onglet-menu-boucles">boucles</span>
            </a>
        </div>
        <div class="lien-container">
            <a href="#" class="onglet-menu">
                <span class="onglet-menu-gps">mon gps</span>
            </a>
        </div>
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

// Préparation de la liste des étapes
function populateListeEtape(etape,i) {
    // On récupère les données de l'étape
    let image=urlStrapi+etape.attributes.image.data.attributes.formats.small.url;
    let distance=etape.attributes.distance;
    let titre=etape.attributes.titre_texte;
    let villeDepart=etape.attributes.ville_depart;
    let villeArrive=etape.attributes.ville_arrive;
    let texte=etape.attributes.texte;
    let difficulte=etape.attributes.difficulte;
    difficulte=getDifficulteHTML(difficulte);

    texte=texte.substring(0,200)+' [...]';
    // On crée la liste des étapes une à une
    listeEtape=listeEtape+`
        <div class="etape-container" onclick="afficheEtape(${i});" onmouseover="ChangeTrack(${i});" onmouseout="quitteTrack(${i});" id="etape-container-${i}">
            <div class="image-etape-container">
                <img src="${image}" class="image-etape">
                <span class="distance-etape">${distance} km</span>
            </div>
            <div class="etape-content-container">
                <h2>${titre}</h2>
                ${difficulte}
                <span class="etape-dep-arr">${villeDepart} &gt; ${villeArrive}</span>
                <p>${texte}</p>
            </div>
        </div>`;
}

// Retourne le code HTML d'un niveau de difficulté (de 1 à 3)
function getDifficulteHTML(difficulte) {
    switch(difficulte) {
        case 1:
            return `<div class="difficulte">
                        <span class="difficulte-1">Je débute / En famille&nbsp</span><b class="difficulte-1-circle"></b>
                    </div>`;
            break;
        case 2:
            return `<div class="difficulte">
                        <span class="difficulte-2">J\'ai l\'habitude&nbsp;</span><b class="difficulte-2-circle"></b>
                    </div>`;
            break;
    }
    return `<div class="difficulte">
                <span class="difficulte-3">Je me dépasse&nbsp;</span><b class="difficulte-3-circle"></b>
            </div>`;
}

// Appelé lorsque l'on clique sur la fléche qui permet de retourner à la liste des étapes
function retourneListeEtape() {
    afficheTopLeftContainer();
    // On injecte la liste des étapes dans le container
    containerListeEtape.innerHTML=listeEtape;
    // On remet la map à son origine
    map.setView([50.8, 2.6],9);
    // On remet les flag à true pour gérer les mouseover et mouseout
    mouseoverToggle = true;
    mouseoutToggle = true;
    if (lastTrackClicked != null) {
        lastTrackClicked.setStyle({ color: '#f59c00' });
    }
    lastTrackClicked = null;
}

function afficheEtape(etape) {
    // Si etape est un number, alors le click vient de la liste de gauche
    // Sinon le click vient de la carte
    flag=(typeof etape=="number");
    villeDepart=flag?etapes[etape].attributes.ville_depart:etape.attributes.ville_depart;
    villeArrive=flag?etapes[etape].attributes.ville_arrive:etape.attributes.ville_arrive;
    texte=flag?etapes[etape].attributes.texte:etape.attributes.texte;
    titre_texte=flag?etapes[etape].attributes.titre_texte:etape.attributes.titre_texte;
    image=flag?etapes[etape].attributes.image.data.attributes.url:etape.attributes.image.data.attributes.url;
    fichierGpx=flag?etapes[etape].attributes.gpx.data[0].attributes.url:etape.attributes.gpx.data[0].attributes.url;
    distance=flag?etapes[etape].attributes.distance:etape.attributes.distance;
    difficulte=flag?etapes[etape].attributes.difficulte:etape.attributes.difficulte;
    index=flag?etapes[etape].index:etape.index;
    numeroEtape=index+1;

    // Si le click vient de la liste de gauche, on affiche l'étape sur la map
    if (flag) AfficheEtapeSurMap(etapes[etape]);

    if (index==0) {
        boutonPrecedent=false;
        etapePrecedente=null;
        villePrecedente='';
    } else {
        boutonPrecedent=true;
        etapePrecedente=index-1;
        villePrecedente=etapes[index-1].attributes.ville_depart;
    }

    if (index==nbEtapes-1) {
        boutonSuivant=false;
        etapeSuivante=null;
        villeSuivante='';
    } else {
        boutonSuivant=true;
        etapeSuivante=index+1;
        villeSuivante=etapes[index+1].attributes.ville_arrive;
    }

    difficulte=getDifficulteHTML(difficulte);

    containerTopleft.innerHTML=`
    <div class="top-etape-flex-column">
        <div class="top-etape-flex-row-1">
            <div class="top-etape-flex-row-2">
                <a href="#" onclick="retourneListeEtape()"><span class="material-symbols-outlined">arrow_back</span></a>
                <div class="top-etape-flex-column">
                    <span class="etape-desc-trajet">${villeDepart} &gt; ${villeArrive}</span>
                    <span class="etape-desc-veloeuro">Le Véloeuro</span>
                </div>
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

    // Calcul étape suivante et étape précédente pour générer les liens
    etapeHTML=`
        <div class="etape-detail-container">
            <div class="etape-detail-top">
                <h2>${titre_texte}</h2>
            </div>
            <div class="etape-detail-flex-row">
                <span class="etape-distance">
                    ${distance} Km&nbsp;&nbsp;
                </span>
                <span class="material-symbols-outlined">settings_ethernet</span>
                <span class="etape-temps">
                 &nbsp;0 h 00 min&nbsp;
                 </span>
                 ${difficulte}
            </div>
            <div class="etape-detail-image">
                <img src="${urlStrapi}${image}">
            </div>
            <div class="etape-detail-dep-arr-flex">
                <div class="etape-detail-ville-depart"><i class="fa-regular fa-circle circle1"></i><span>&nbsp;${villeDepart}</span></div>
                <div><span class="material-symbols-outlined">swap_horiz</span></div>
                <div class="etape-detail-ville-arrive"><i class="fa-regular fa-circle circle2"></i><span>&nbsp;${villeArrive}</span></div>
            </div>
            <div class="etape-detail-description">
                <p>${texte}</p>
            </div>
            <div class="etape-bottom-block-fixed">
                <div class="etape-detail-bottom-link">
                    <a href="#"><span class="material-symbols-outlined">favorite_border</span>&nbsp;CARNET DE VOYAGE</a>
                    <a href="${urlStrapi}${fichierGpx}"><span class="material-symbols-outlined">file_download</span>&nbsp;TRACE GPX</a>
                    <a href="#"><span class="material-symbols-outlined">print</span>&nbsp;FICHE PDF</a>
                </div>
                <div class="etape-detail-bottom-button">
                    <div class="container-bouton-precedent" id="bouton-etape-precedente">
                        <div><a href="#" onclick="afficheEtape(${etapePrecedente})"><span class="material-symbols-outlined">arrow_back</span></a></div>
                        <div class="etape-detail-bottom-bouton-precedent">
                            <a href="#" onclick="afficheEtape(${etapePrecedente})">
                                <span>étape précédente</span><br>
                                depuis ${villePrecedente}
                            </a>
                        </div>
                    </div>
                    <div class="etape-detail-bottom-numero-etape">
                        ${numeroEtape}/${nbEtapes}
                    </div>
                    <div class="container-bouton-suivant" id="bouton-etape-suivante">
                        <div class="etape-detail-bottom-bouton-suivant">
                            <a href="#" onclick="afficheEtape(${etapeSuivante})">
                                <span>étape suivante</span><br>
                                vers ${villeSuivante}
                            </a>
                        </div>
                        <div><a href="#" onclick="afficheEtape(${etapeSuivante})"><span class="material-symbols-outlined">arrow_forward</span></a></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Le container de la liste des étapes sert aussi de container pour une description d'une étape
    containerListeEtape.innerHTML=etapeHTML;

    // On cache les boutons suivant ou précédent si besoin
    divBoutonPrecedent=document.getElementById('bouton-etape-precedente');
    divBoutonSuivant=document.getElementById('bouton-etape-suivante');

    // On affiche ou pas les boutons précédent et suivant
    divBoutonPrecedent.style.visibility=(boutonPrecedent==false)?'hidden':'visible';
    divBoutonSuivant.style.visibility=(boutonSuivant==false)?'hidden':'visible';

    // On remonte le scrool au début de l'étape
    containerLeftSide.scroll(0,0);
}

// Clic des boutons
function AfficheEtapeSurMap(etape) {
    // On met les flags à false pour ne pas gérer les mouseover et mouseout
    mouseoverToggle = false;
    mouseoutToggle = false;
    // Si une track été déjà cliqué alors on la remet à sa couleur d'origine
    if (lastTrackClicked!=null) {
        lastTrackClicked.setStyle({ color: '#f59c00' })
    }
    // On stocke la dernière étape cliquée
    lastTrackClicked=etape.gpx;
    // On centre la carte sur l'étape
    map.fitBounds(etape.gpx.getBounds());
    // On met le tracé en vert
    etape.gpx.setStyle({
        color: '#07756d'
    });
}

// Si on passe sa souris sur une étape depuis la liste des étapes à gauche, on change la couleur du tracé sur la carte
function ChangeTrack(indexEtape) {
    if (lastTrackClicked!=null) {
        lastTrackClicked.setStyle({ color: '#f59c00' })
    }
    etapes[indexEtape].gpx.setStyle({ color: '#07756d'});
    lastTrackClicked=etapes[indexEtape].gpx;
}

// Remet la track en orange. Appelée après un mouseout du container de l'étape correspondante dans la liste de gauche
function quitteTrack(indexEtape) {
    etapes[indexEtape].gpx.setStyle({ color: '#f59c00'});
}
