
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
const cancelDirectionsButton = document.getElementById("cancel-directions");
const originInput = document.getElementById("origin-input");
const originSearchBox = new google.maps.places.SearchBox(originInput);
const destinationInput = document.getElementById("destination-input");
const destinationSearchBox = new google.maps.places.SearchBox(destinationInput);
const connectButton = document.getElementById('connect-ble-button');
const disconnectButton = document.getElementById('disconnect-ble-button');
const onButton = document.getElementById('on-button');
const textField = document.getElementById('text-field');
const latestValueSent = document.getElementById('value-sent');
const bleStateContainer = document.getElementById('ble-state');

const directionDictionary = {
  "TURN_LEFT": 1,
  "TURN_SLIGHT_LEFT": 2,
  "TURN-SHARP_LEFT": 3,
  "FORK_LEFT": 4,
  "TURN_RIGHT": 5,
  "TURN_SLIGHT_RIGHT": 6,
  "TURN_SHARP_RIGHT": 7,
  "FORK_RIGHT": 8,
  "STRAIGHT": 9
}
// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
    // locate you.
let map, infoWindow, directionsService, directionsRenderer, gettingDirections;

let deviceName = 'ESP32';
let bleService = '19b10000-e8f2-537e-4f6c-d104768a1214';
let ledCharacteristic = '19b10002-e8f2-537e-4f6c-d104768a1214';
let sensorCharacteristic = '19b10001-e8f2-537e-4f6c-d104768a1214'
let bleServer;
let bleServiceFound;
let sensorCharacteristicFound;

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

cancelDirectionsButton.onclick = () => {
  gettingDirections = false
}

function isWebBluetoothEnabled() {
  if (!navigator.bluetooth) {
    console.log("Web Bluetooth API is not available in this browser!");
    bleStateContainer.innerHTML = "Web Bluetooth API is not available in this browser/device!";
    return false
  }
  console.log('Web Bluetooth API supported in this browser.');
  return true
}

function connectToDevice() {
  navigator.bluetooth.requestDevice({
    filters: [{name: deviceName}],
    optionalServices: [bleService]
})
.then(device => {
  console.log('Device Selected:', device.name);
  bleStateContainer.innerHTML = 'Connected to device ' + device.name;
  bleStateContainer.style.color = "#24af37";
  device.addEventListener('gattservicedisconnected', onDisconnected);
  return device.gatt.connect();
})
.then(gattServer => {
  bleServer = gattServer;
  console.log("Connected to GATT Server");
  return bleServer.getPrimaryService(bleService);
})
.then(service => {
  bleServiceFound = service;
  console.log("Service discovered:", service.uuid);
  return service.getCharacteristic(sensorCharacteristic);
})
.then(characteristic => {
  console.log("Characteristic discovered:", characteristic.uuid);
  sensorCharacteristicFound = characteristic;
  //characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicChange);
  characteristic.startNotifications();
  console.log("Notifications Started.");
  return characteristic.readValue();
})
.then(value => {
  // console.log("Read value: ", value);
  // const decodedValue = new TextDecoder().decode(value);
  // console.log("Decoded value: ", decodedValue);
  // retrievedValue.innerHTML = decodedValue;
})
}

function onDisconnected(event){
  console.log('Device Disconnected:', event.target.device.name);
  bleStateContainer.innerHTML = "Device disconnected";
  bleStateContainer.style.color = "#d13a30";

  connectToDevice();
}

// function handleCharacteristicChange(event){
//   const newValueReceived = new TextDecoder().decode(event.target.value);
//   console.log("Characteristic value changed: ", newValueReceived);
//   retrievedValue.innerHTML = newValueReceived;
// }

function writeOnCharacteristic(value){
  if (bleServer && bleServer.connected) {
    bleServiceFound.getCharacteristic(ledCharacteristic)
     .then(characteristic => {
        console.log("Found the LED characteristic: ", characteristic.uuid);
        const data = new Uint8Array([value]);
        return characteristic.writeValue(data);
      })
      .then(() => {
        latestValueSent.innerHTML = value;
        console.log("Value written to LEDcharacteristic:", value);
    })
  } else {
    console.error ("Bluetooth is not connected. Cannot write to characteristic.")
    window.alert("Bluetooth is not connected. Cannot write to characteristic. \n Connect to BLE first!")
}
}

function disconnectDevice() {
  console.log("Disconnect Device.");
  if (bleServer && bleServer.connected) {
      if (sensorCharacteristicFound) {
          sensorCharacteristicFound.stopNotifications()
              .then(() => {
                  console.log("Notifications Stopped");
                  return bleServer.disconnect();
              })
              .then(() => {
                  console.log("Device Disconnected");
                  bleStateContainer.innerHTML = "Device Disconnected";
                  bleStateContainer.style.color = "#d13a30";

              })
              .catch(error => {
                  console.log("An error occurred:", error);
              });
      } else {
          console.log("No characteristic found to disconnect.");
      }
  } else {
      // Throw an error if Bluetooth is not connected
      console.error("Bluetooth is not connected.");
      window.alert("Bluetooth is not connected.")
  }
}

connectButton.onclick = () => {
  if (isWebBluetoothEnabled()){
    connectToDevice();
  }
}

disconnectButton.onclick = () => {
  disconnectDevice();
}

onButton.onclick = () => {
  writeOnCharacteristic(textField.value);
}

function WaitForDirections(data, step = 0){
  if (!gettingDirections) return;
  if (data[step] === undefined) return;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              
              const origin = new google.maps.LatLng(pos.lat, pos.lng);
              const destination = new google.maps.LatLng(data[step].lat, data[step].lng);
              const service = new google.maps.DistanceMatrixService();
              service.getDistanceMatrix(
                {
                  origins: [origin],
                  destinations: [destination],
                  travelMode: 'WALKING'
                }, (result, status) => {
                  if (status === 'OK'){
                    const distance = result.rows[0].elements[0].distance;
                    if (distance.value < 10){
                      console.log(data[step].maneuver);
                      console.log(directionDictionary[data[step].maneuver]);
                      if (data[step].maneuver === undefined) {
                        writeOnCharacteristic(0);
                      } else {
                        writeOnCharacteristic(directionDictionary[data[step].maneuver]);
                      }
                      console.log('next step');
                      WaitForDirections(data, step + 1)
                    }
                    else {
                      console.log('try again')
                      setTimeout(() => {WaitForDirections(data, step)}, 5000)
                    }
                  }
                }
              )
          },
          () => {
          },
          );
      } else {
          // Browser doesn't support Geolocation
          console.log('no geolocation')
      }
}
  
const fetchConfig = async () => {
    const response = await fetch(`https://notegot.dk/route?destination=${destinationInput.value}&mode=walking&origin=${originInput.value}&key=AIzaSyB8xI3vA3bcGOo7cNG7SWy6GQyIDGt6HcE`);
    return await response.json();
  }

async function GetDirections() {
  gettingDirections = true
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
      // const {geocoded_waypoints, request, routes, status} = result;
      // console.log(routes);
      // const route = routes[0];
      // const {legs} = route;
      // const leg = legs[0]
      // const {steps} = leg
      // const step0 = steps[0]
      // const {end_location} = step0
      // console.log(end_location);
      return directions = result;
    }
    else console.log('Error');
    })

    const data = await fetchConfig()
    const steps = data.routes[0].legs[0].steps
    console.log(steps)
    let stepData = []
    for (let i = 0; i < steps.length; i++){
      const lat = steps[i].end_location.lat
      const lng = steps[i].end_location.lng
      const prop = 'maneuver'
      let maneuver
      if (steps[i].hasOwnProperty(prop)) {
        maneuver = steps[i].maneuver
      }
      else {
        maneuver = undefined;
      }
      stepData.push({lat: lat, lng: lng, maneuver: maneuver})
    }
    console.log(stepData)
    
    WaitForDirections(stepData);

     // window.initMap = initMap;
  }
 directionsButton.onclick = () => {
     GetDirections()
 }

initMap()
initAutocomplete()