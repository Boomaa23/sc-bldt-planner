document.getElementById("storage-in").onkeypress = function(e) {
    if (e.key === "Enter") {
        document.getElementById("storage-submit").click();
    }
}

document.getElementById("storage-qty-in").onkeypress = function(e) {
    if (e.key === "Enter") {
        document.getElementById("storage-submit").click();
    }
}

document.getElementById("craft-in").onkeyup = function(e) {
    document.getElementById("search-submit").click();
}

function storeItem() {
    const itemName = document.getElementById("storage-in").value;
    const itemQty = document.getElementById("storage-qty-in").value;
    backendRequest("storage/add", [ itemName, itemQty ], storeItemCallback, true);
}

function storeItemCallback(resp) {
}

//TODO implement remove item

function searchItem() {
    const itemName = document.getElementById("craft-in").value;
    backendRequest("items/search", itemName, searchItemCallback, true);
}

function searchItemCallback(resp) {
    var craftOut = document.getElementById("craft-out");
    craftOut.innerText = "";
    const json = JSON.parse(resp);
    const keys = Object.keys(json);

    const navHeader = document.getElementById("item-navheader").content;
    craftOut.appendChild(navHeader.cloneNode(true))

    const itemTemplate = document.getElementById("item-template").content;
    for (var i = 0; i < keys.length; i++) {
        var itemOut = itemTemplate.cloneNode(true);
        itemOut.querySelector("img").src = "data/icons/" + keys[i].toLowerCase().split(' ').join('') + ".png";
        
        var itemRows = itemOut.querySelectorAll("td");
        const value = json[keys[i]];
        itemRows[1].innerText = keys[i];
        itemRows[2].innerText = value.time;
        itemRows[3].innerText = value.value;
        itemRows[4].innerText = value.level;
        
        craftOut.appendChild(itemOut);
    }
}

function backendRequest(endpoint, data, callback = null, logResp = false) {
    var xhr = new XMLHttpRequest();
    var url = "backend.php?endpoint=" + encodeURIComponent(endpoint);
    if (data !== null) {
        url += "&data=" + btoa(encodeURIComponent(data));
    }
    console.log(endpoint + ": " + data);
    console.log(url);
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status === 200) {
            if (logResp) {
                console.log(xhr.responseText);
            }
            if (callback !== null) {
                callback(xhr.responseText);
            }
        } else {
            console.error("Request to backend " + method + " " + url + " responded with " + xhr.status);
        }
    }
}