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

  // scramble location values
  var scrambledLocation = positionScrambler(latitude,longitude);
  scrambledLat = scrambledLocation[0]; 
  scrambledLong = scrambledLocation[1];


}

function positionScrambler(latitude, longitude) {
  // 1 degree latitude ~ 69 miles 
  // (ranges from 68.703 mi [equator] to 69.407 mi [poles])
  // averaging this value out approximates us at ~45 degrees latitude
  // cos(latitude) * 69.172
  // this is approximate; 69.172 is the distance [mi] of 1 deg longitude @ equator
  // we could approximate it to the distances at 40 degrees latitude, around middle of US

  // Define objects
  const status = document.querySelector('#status');
  const mapLink = document.querySelector('#map-link');
  const scrambledMapLink = document.querySelector('#scrambled-map-link');
  const latOut = document.querySelector('#latOut');
  const longOut = document.querySelector('#longOut');

    // clear variables
    // mapLink.href = ''; is this even worth doing? Could be helpful to handle unchanged coords
    // mapLink.textContent = '';

  console.log("Original coordinates: ",latitude,longitude);

  var latConversion = (68.703 + 69.407)/2; // [mi/deg] from lat to miles
  var latRadius = 0.5/latConversion; // half a mile in degrees latitude

  var radLat = latitude*Math.PI/180;
  var longConversion = Math.cos(radLat) * 69.172;
  var longRadius = 0.5/longConversion; // half a mile in degrees longitude

  console.log("Conversion radii: ",latRadius,longRadius);

  // randomized radius values to add to position (+/- no more than half a mile)
  latScrambledRadius = Math.random() * 2*latRadius - latRadius; 
  longScrambledRadius = Math.random() * 2*longRadius - longRadius;

  console.log("Scrambling distances",latScrambledRadius,longScrambledRadius);

  // final scrambled location
  var scrambledLat = latitude + latScrambledRadius;
  var scrambledLong = longitude + longScrambledRadius;
  console.log(scrambledLat,scrambledLong);

  // write to location test page
  mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
  mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
  scrambledMapLink.href = `https://www.openstreetmap.org/#map=18/${scrambledLat}/${scrambledLong}`;
  scrambledMapLink.textContent = `Latitude: ${scrambledLat} °, Longitude: ${scrambledLong} °`;
  latOut.textContent = scrambledLat;
  longOut.textContent = scrambledLong;

  return [scrambledLat,scrambledLong];
}