const socket = io();

console.log(navigator);

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("sendLocation", { latitude, longitude });
    },
    (error) => {
      console.log(error);
    }
  );
}

const map = L.map("map").setView([0, 0], 22);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

const markers = {};

// Load existing locations when a new user joins
socket.on("loadExistingLocations", (users) => {
  Object.values(users).forEach((user) => {
    addMarker(user.id, user.latitude, user.longitude, false);
  });
});

function addMarker(id, latitude, longitude, isDraggable) {
  const marker = L.marker([latitude, longitude], {
    draggable: isDraggable,
  }).addTo(map);
  markers[id] = marker;

  if (isDraggable) {
    marker.on("dragend", function (event) {
      const { lat, lng } = event.target.getLatLng();
      socket.emit("updateLocation", { latitude: lat, longitude: lng });
    });
  }
}

socket.on("receiveLocation", (data) => {
  console.log("data", data);
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);

  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    addMarker(id, latitude, longitude, id === socket.id);
  }
});

socket.on("removeLocation", (data) => {
  if (markers[data.id]) {
    map.removeLayer(markers[data.id]);
    delete markers[data.id];
  }
});
