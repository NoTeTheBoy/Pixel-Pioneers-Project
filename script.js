
(g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: "AIzaSyB8xI3vA3bcGOo7cNG7SWy6GQyIDGt6HcE",
  v: "weekly",
  // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
  // Add other bootstrap parameters as needed, using camel case.
});
console.log("test1");

const {Map} = await google.maps.importLibrary("maps");
const {SearchBox} = await google.maps.importLibrary("places");
const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");
const {DirectionsService} = await google.maps.importLibrary("routes");
const {TravelMode} = await google.maps.importLibrary("routes")
const mapContainer = document.getElementById("map");
const inputBox = document.getElementById("search-bar");
const directionsButton = document.getElementById("directions-button");
const originInput = document.getElementById("origin-input");
const originSearchBox = new google.maps.places.SearchBox(originInput);
const destinationInput = document.getElementById("destination-input");
const destinationSearchBox = new google.maps.places.SearchBox(destinationInput);

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
    // locate you.
let map, infoWindow, directionsService, directionsRenderer;

function initMap() {
  map = new google.maps.Map(mapContainer, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 6,
    mapId: "DEMO_MAP_ID"
  });
  infoWindow = new google.maps.InfoWindow();

  const locationButton = document.createElement("button");

  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  locationButton.addEventListener("click", () => {
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    
                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                },
                );
            } else {
                // Browser doesn't support Geolocation
                handleLocationError(false, infoWindow, map.getCenter());
            }
        });  
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
      browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation.",
      );
      infoWindow.open(map);
}    
    

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        originSearchBox.setBounds(map.getBounds());
    });
    map.addListener("bounds_changed", () => {
        destinationSearchBox.setBounds(map.getBounds());
    });
    
    let originMarkers = []
    let destinationMarkers = [];

    
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    originSearchBox.addListener("places_changed", () => {
        const places = originSearchBox.getPlaces();
        
        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        originMarkers.forEach((marker) => {
            marker.setMap(null);
      });
      originMarkers = [];
  
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
  
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        // const icon = {
        //   url: place.icon,
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25),
        // };
  
        // Create a marker for each place.
        originMarkers.push(
          new google.maps.marker.AdvancedMarkerElement({
            map,
            // icon,
            title: place.name,
            position: place.geometry.location,
          }),
        );
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
    destinationSearchBox.addListener("places_changed", () => {
        const places = destinationSearchBox.getPlaces();
        
        if (places.length == 0) {
            return;
        }
        
        // Clear out the old markers.
        destinationMarkers.forEach((marker) => {
            marker.setMap(null);
      });
      destinationMarkers = [];
  
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
  
      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }
  
        // const icon = {
        //   url: place.icon,
        //   size: new google.maps.Size(71, 71),
        //   origin: new google.maps.Point(0, 0),
        //   anchor: new google.maps.Point(17, 34),
        //   scaledSize: new google.maps.Size(25, 25),
        // };
  
        // Create a marker for each place.
        destinationMarkers.push(
          new google.maps.marker.AdvancedMarkerElement({
            map,
            // icon,
            title: place.name,
            position: place.geometry.location,
          }),
        );
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
}

function GetDirections() {
  console.log('Test GetDirections');
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map)
  let directions;

  const request = {
          origin: originInput.value,
          destination: destinationInput.value,
          travelMode: 'WALKING'
        }


 directionsService.route(request, function(result, status){
    if (status === "OK"){
      directionsRenderer.setDirections(result);
      const {geocoded_waypoints, request, routes, status} = result  
      console.log(routes);
      return directions = result;
    }
    else console.log('Error');

 })

     // window.initMap = initMap;
     }
 directionsButton.onclick = () => {
     GetDirections()
 }

initMap()
initAutocomplete()