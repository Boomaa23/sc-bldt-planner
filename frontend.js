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

window.onload = function() {
    backendRequest("storage/get", "", storeItemCallback);
}

function storeItem() {
    const itemName = document.getElementById("storage-in").value;
    const itemQty = document.getElementById("storage-qty-in").value;
    backendRequest("storage/add", [ itemName, itemQty ], storeItemCallback);
}

function storeItemCallback(respText) {
    var storeOut = document.getElementById("storage-out");

    const respJson = JSON.parse(respText);
    const respKeys = Object.keys(respJson);

    if (storeOut.innerText === "" && respKeys.length != 0) {
        const navHeader = document.getElementById("storage-navheader").content;
        storeOut.appendChild(navHeader.cloneNode(true))
    }

    const itemTemplate = document.getElementById("storage-row").content;
    for (var i = 0; i < respKeys.length; i++) {
        if (respJson[respKeys[i]] === 0) {
            const allStoreTr = storeOut.querySelectorAll("tr");
            for (var j = 0; j < allStoreTr.length; j++) {
                if (allStoreTr[j].innerText.includes(respKeys[i])) {
                    allStoreTr[j].remove();
                    break;
                }
            }
            continue;
        }

        const allStoreTd = storeOut.querySelectorAll("td");
        var itemExists = false;
        for (var j = 0; j < allStoreTd.length - 1; j++) {
            if (allStoreTd[j].innerText === respKeys[i]) {
                allStoreTd[j + 1].innerText = respJson[respKeys[i]];
                itemExists = true;
                break;
            }
        }
        if (itemExists) {
            continue;
        }
        var itemOut = itemTemplate.cloneNode(true);
        itemOut.querySelector("img").src = "data/icons/" + respKeys[i].toLowerCase().split(' ').join('') + ".png";
        
        var itemCols = itemOut.querySelectorAll("td");
        itemCols[1].innerText = respKeys[i];
        itemCols[2].innerText = respJson[respKeys[i]];
        
        var qtyBtns = itemOut.querySelectorAll("button");
        for (var j = 0; j < qtyBtns.length; j++) {
            var btnOc = qtyBtns[j].getAttribute("onclick");
            qtyBtns[j].setAttribute("onclick", btnOc.substring(0, btnOc.length - 1) + ", '" + respKeys[i] + "');");
        }

        storeOut.appendChild(itemOut);
    }

    if (storeOut.querySelectorAll("tr").length === 1) {
        storeOut.innerText = "";
    }
}

function changeItemQty(dir, mtl) {
    backendRequest("storage/add", [ mtl, dir ], storeItemCallback);
}

function searchItem() {
    const itemName = document.getElementById("craft-in").value;
    backendRequest("items/search", itemName, searchItemCallback);
}

function searchItemCallback(respText) {
    var craftOut = document.getElementById("craft-out");
    craftOut.innerText = "";

    if (respText === "false") {
        return;
    }

    const respJson = JSON.parse(respText);
    const respKeys = Object.keys(respJson);

    const navHeader = document.getElementById("craft-navheader").content;
    craftOut.appendChild(navHeader.cloneNode(true))

    const itemTemplate = document.getElementById("craft-row").content;
    for (var i = 0; i < respKeys.length; i++) {
        const mtlVals = respJson[respKeys[i]];
        const mtlKeys = Object.keys(mtlVals);
        for (var j = 0; j < mtlKeys.length; j++) {
            var itemOut = itemTemplate.cloneNode(true);
            itemOut.querySelector("img").src = "data/icons/" + mtlKeys[j].toLowerCase().split(' ').join('') + ".png";
            
            const mtlVal = mtlVals[mtlKeys[j]];
            var itemCols = itemOut.querySelectorAll("td");
            itemCols[1].innerText = mtlKeys[j];
            itemCols[2].innerText = mtlVal.time;
            itemCols[3].innerText = mtlVal.value;
            var gpm = mtlVal.value / mtlVal.time;
            gpm = + gpm.toFixed(2);
            itemCols[4].innerText = gpm;
            itemCols[5].innerText = mtlVal.level;
            itemCols[6].innerText = respKeys[i];
            
            craftOut.appendChild(itemOut);
        }
    }
}

function sortItems(tableId, colIdx, desc) {
    var table = document.getElementById(tableId);
    var evalNext = true;

    while (evalNext) {
        evalNext = false;
        var rows = table.rows;
        for (var i = 1; i < rows.length - 1; i++) {
            var doSwitch = false;
            var a = rows[i].getElementsByTagName("td")[colIdx].innerText.toLowerCase();
            var b = rows[i + 1].getElementsByTagName("td")[colIdx].innerText.toLowerCase();
            const ai = parseFloat(a);
            const bi = parseFloat(b);
            if (!isNaN(ai) && !isNaN(bi)) {
                a = ai;
                b = bi;
            }
            if ((!desc && a > b) || (desc && a < b)) {
                doSwitch = true;
                break;
            }
        }
        if (doSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            evalNext = true;
        }
    }

    var headerRow = table.rows[0].querySelectorAll("a");
    for (var i = 0; i < headerRow.length; i++) {
        var header = headerRow[i];
        headerRow[i].innerText = headerRow[i].innerText.substring(0, headerRow[i].innerText.length - 1) + String.fromCharCode(9654);
        headerRow[i].setAttribute("href", headerRow[i].getAttribute("href").replace("true", "false"));
    }

    var header = table.rows[0].querySelectorAll("a")[colIdx - 1];
    header.innerText = header.innerText.substring(0, header.innerText.length - 1) + (desc ? String.fromCharCode(9650) : String.fromCharCode(9660));
    var jsCall = header.getAttribute("href");
    header.setAttribute("href", desc ? jsCall.replace("true", "false") : jsCall.replace("false", "true"));
}

function backendRequest(endpoint, data, callback = null, doLog = true) {
    var xhr = new XMLHttpRequest();
    var url = "backend.php?endpoint=" + encodeURIComponent(endpoint);
    if (data !== null) {
        url += "&data=" + btoa(encodeURIComponent(data));
    }
    if (doLog) {
        console.log(endpoint + ": " + data);
        console.log(url);
    }
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onload = function() {
        if (xhr.status === 200) {
            if (doLog) {
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