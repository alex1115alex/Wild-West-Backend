function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getLocationHelper);
  } else {
    //User's browser wont give location data
    alert("Geolocation is not supported by this browser.");
    //kick them off?
  }
}

function getLocationHelper(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
}