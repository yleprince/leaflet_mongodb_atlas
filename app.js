// Initialize the App Client
const client = stitch.Stitch.initializeDefaultAppClient("binlabels_poc-rqfor");
// Get a MongoDB Service Client
const mongodb = client.getServiceClient(
stitch.RemoteMongoClient.factory,
"mongodb-atlas"
);
// Get a reference to the bins database
const db = mongodb.db("bins");

var greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// L.marker([51.5, -0.09], ).addTo(map);

client.auth
  .loginWithCredential(new stitch.AnonymousCredential())
  .then(() => {
  	console.log('Auth succeed');
  })
  .catch(console.error);

let bins = [];

const mapbox_access_token = 'your-token';
var mymap = L.map('map').setView([48.859489, 2.337591], 12.25);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: mapbox_access_token
}).addTo(mymap);

let markers = L.layerGroup();
mymap.addLayer(markers);

load_btn.addEventListener('click', () => load());
export_btn.addEventListener('click', () => export_data());

function load() {
	bins = [];
	// console.log('click load');
	db.collection("labels")
	  .find({}, {limit: 1000})
	  .asArray()
	  .then(mongoBins => {
	          console.log('bins loaded', mongoBins);
	  	      bins = mongoBins;
			  displayBins(mongoBins);
	  	    }
        );
}

function displayBins(bins) {
	markers.clearLayers();
	bins.map((bin) => {
		const marker = L.marker([bin.lat, bin.long]).bindPopup("Added from server");
		markers.addLayer(marker);
	});
}

function export_data() {
	bins.map((bin) => {
	  db.collection("labels")
	  .insertOne(bin)
	  .then(() => {
		  console.log('Bin', bin);
	  });
	});
	displayBins(bins);
}

function addBin(lat, long, comment) {
	const bin = { owner_id : client.auth.user.id, lat, long, comment };
	bins.push(bin);

	const marker = L.marker([bin.lat, bin.long], {icon: greenIcon}).bindPopup("Added from click");
	markers.addLayer(marker);
}

function onMapClick(e) {
	addBin(e.latlng.lat, e.latlng.lng, 'added on click');
}

mymap.on('click', onMapClick);
