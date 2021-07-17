// create the map
let myMap = L.map('main-map').setView([52.520008,13.404954], 13);
// using OpenStreetMap tiles for now
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo(myMap);

function clearAlerts() {
  document.querySelectorAll('.alert').forEach((e) => {e.style.visibility = "hidden"});
}

// keyword search for tags
document.getElementById("search-form").addEventListener("input", clearAlerts);
document.getElementById("search-form").addEventListener("click", clearAlerts);
document.getElementById("search-form").addEventListener("submit", function(e){
  e.preventDefault();
  let keyword = document.getElementById("keyword-search").value;
  fetch("/tag/" + keyword, {method: "GET"})
  .then(function(response) {
    if (response.status == 404) {
      document.getElementById("no-tag-alert").style.visibility = "visible"
    }
    if (response.ok) {
      response.json().then(tagObj => {
        // TODO: display the tag object somehow
        console.log(tagObj);
      })
    }
  })
});
