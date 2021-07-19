let apiHost = "http://localhost:5000";
var allTagMarkers = [];

// create the map
let myMap = L.map('main-map').setView([52.520008,13.404954], 12);
// using OpenStreetMap tiles for now
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: ['a','b','c']
}).addTo(myMap);

function clearAlerts() {
  document.querySelectorAll('.alert').forEach((e) => {e.style.opacity = "0%"});
}

function clearAllMarkers() {
  for (marker of allTagMarkers) {
    marker.remove(myMap);
  }
  allTagMarkers = [];
}

function postMessage(tag) {
  return (e) => {
    if (e.srcElement.validity.valid) {
      let message = e.srcElement.value;
      let messageObj = {text: message};
      fetch(apiHost + "/msg/" + tag.tag_name,{
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(messageObj)
      })
      .then((res) => res.json())
      .then((newTag) => {
        displayTagInfo(newTag, false);
      })
      .catch((err) => {console.error("Message post error %o", err)});
    }
  }
}

function displayTagInfo(tag, searchResult) {
  console.log("Found tag: %o", tag);
  // Clear out any stuff that needs to go
  let mission = document.getElementById("mission-statement");
  if (mission != null) {
    mission.remove();
  }
  let oldCombinedDiv = document.getElementById("combinedDiv");
  if (oldCombinedDiv != null) {
    oldCombinedDiv.remove();
  }
  let pane = document.getElementById("tag-info-pane");
  let combinedDiv = document.createElement("div");
  combinedDiv.id = "combinedDiv";
  let messageDiv = document.createElement("div");
  messageDiv.id = "messageDiv";

  // Assemble the title header for the message bubble
  let messageTitle = document.createElement("div");
  messageTitle.classList.add("messageDivTitle");
  messageTitleText = document.createElement("span");
  messageTitleText.classList.add("messageDivTitleText");
  messageTitleText.innerText = tag.tag_name;
  messageTitle.appendChild(messageTitleText);
  messageDiv.appendChild(messageTitle);
  let hr = document.createElement("hr");
  hr.id = "rule";
  messageDiv.appendChild(hr);
  // Assemble the list of messages
  let messageList = document.createElement("ol");
  messageDiv.appendChild(messageList);
  for (message of tag.messages) {
    let messageLi = document.createElement("li");
    let messageText = document.createElement("span");
    messageText.classList.add("messageText");
    messageText.innerText = message.text;
    let messageTime = document.createElement("span");
    messageTime.classList.add("messageTime");
    let date = new Date(message.created_at);
    messageTime.innerText = date.toDateString();
    messageLi.appendChild(messageText);
    messageLi.appendChild(messageTime);
    messageList.appendChild(messageLi);
  }
  // Add the input to add your own message
  let inputDiv = document.createElement("div");
  inputDiv.classList.add("form-floating");
  inputDiv.id = "messageInputDiv";
  let input = document.createElement("input");
  let label = document.createElement("label");
  input.type = "text";
  input.maxLength = 255;
  input.minLength = 2;
  input.id = "messageInput";
  input.classList.add("form-control");
  input.placeholder = "Add your message";
  input.addEventListener("change", postMessage(tag));
  label.for = "messageInput";
  label.innerText = "Add your message";
  inputDiv.appendChild(input);
  inputDiv.appendChild(label);

  combinedDiv.appendChild(messageDiv);
  combinedDiv.appendChild(inputDiv);
  pane.appendChild(combinedDiv);
  if (!searchResult) {
    input.scrollIntoView();
    input.focus();
  }
}

// keyword search for tags
document.getElementById("search-form").addEventListener("input", clearAlerts);
document.getElementById("search-form").addEventListener("click", clearAlerts);
document.getElementById("search-form").addEventListener("submit", function(e){
  e.preventDefault();
  let keyword = document.getElementById("keyword-search").value;
  // TODO: use actual backend
  fetch(apiHost + "/tag/" + keyword, {method: "GET"})
  .then(function(response) {
    if (response.status == 404) {
      document.getElementById("no-tag-alert").style.opacity = "100%";
    }
    if (response.ok) {
      response.json().then(tag => {
        clearAllMarkers()
        L.marker([tag.lat, tag.lon]).addTo(myMap);
        myMap.flyTo([tag.lat, tag.lon], 17);
        displayTagInfo(tag, true);
      })
    }
  })
});

// on start, show all tags on map
fetch(apiHost + "/alltags", {method: "GET"})
.then(response => response.json())
.then(tags => {
  for (tag of tags) {
    let tagMarker = L.marker([tag.lat, tag.lon]);
    tagMarker.addTo(myMap);
    allTagMarkers.push(tagMarker);
  }
})
