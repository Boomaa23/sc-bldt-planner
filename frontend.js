class MatStats {
    timeMin = 0;
    timeMax = 0;
    goodValue = 0;
    levelMin = 0;

    addOther(other) {
        this.timeMin += other.timeMin;
        this.timeMax += other.timeMax;
        this.goodValue -= other.goodValue;
        this.levelMin = Math.min(this.levelMin, other.levelMin);
    }

    multQty(qty) {
        this.timeMin *= qty;
        this.timeMax *= qty;
        this.goodValue *= qty;
    }

    isBlank() {
        return this.timeMin === 0 && 
            this.timeMax === 0 && 
            this.goodValue === 0 && 
            this.levelMin === 0;
    } 
}

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

document.getElementById("bldg-mtl-in").onkeypress = function(e) {
    if (e.key === "Enter") {
        document.getElementById("bldg-mtl-add").click();
    }
}

document.getElementById("bldg-qty-in").onkeypress = function(e) {
    if (e.key === "Enter") {
        document.getElementById("bldg-mtl-add").click();
    }
}

document.getElementById("craft-in").onkeyup = function(e) {
    document.getElementById("search-submit").click();
}

window.onload = function() {
    backendRequest("items/search", "", initCrafting);
    backendRequest("storage/get", "", function(respText) {
        storeItemCallback(respText);
        backendRequest("queue/get", "", queueBldgCallback);
    });
}

function initCrafting(respText) {
    var craftOut = document.getElementById("craft-out");
    const navHeader = document.getElementById("craft-navheader").content;
    craftOut.appendChild(navHeader.cloneNode(true))
    searchItemCallback(respText);
    craftOut = document.getElementById("craft-out");
    var rows = craftOut.querySelectorAll("tr");
    for (var k = 0; k < rows.length; k++) {
        rows[k].style = "display: none;";
    }
}

function storeItem() {
    const itemName = document.getElementById("storage-in").value;
    const itemQty = document.getElementById("storage-qty-in").value;
    backendRequest("storage/add", [ itemName, itemQty ], storeItemCallback);
}

function storeItemCallback(respText) {
    var storeOut = document.getElementById("storage-out");
    const bldgOut = document.getElementById("bldg-out");

    const respJson = JSON.parse(respText);
    const respKeys = Object.keys(respJson);

    if (storeOut.innerText === "" && respKeys.length != 0) {
        const navHeader = document.getElementById("storage-navheader").content;
        storeOut.appendChild(navHeader.cloneNode(true))
    }

    const itemTemplate = document.getElementById("storage-row").content;
    for (var i = 0; i < respKeys.length; i++) {
        const bldgQueueTrs = bldgOut.querySelectorAll("tr");
        for (var j = 0; j < bldgQueueTrs.length; j++) {
            if (bldgQueueTrs[j].innerText.includes(respKeys[i]) && bldgQueueTrs[j].classList.contains("inner-table")) {
                var qtyCell = bldgQueueTrs[j].cells[2];
                const ioSep = qtyCell.innerText.indexOf("/");
                qtyCell.innerText = respJson[respKeys[i]] + qtyCell.innerText.substring(ioSep - 1);
            }
        }
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
    document.getElementById("storage-in").value = "";
    document.getElementById("storage-qty-in").value = "1";
}

function changeItemQty(dir, mtl) {
    backendRequest("storage/add", [ mtl, dir ], storeItemCallback);
}

function searchItem() {
    var craftOut = document.getElementById("craft-out");
    var rows = craftOut.querySelectorAll("tr");
    rows[0].style = "display: default;";
    const itemName = document.getElementById("craft-in").value;
    backendRequest("items/search", itemName, searchItemCallback);
}

function searchItemCallback(respText) {
    var craftOut = document.getElementById("craft-out");
    var rows = craftOut.querySelectorAll("tr");

    for (var k = 1; k < rows.length; k++) {
        rows[k].style = "display: none;";
    }

    if (respText === "false") {
        return;
    }

    const respJson = JSON.parse(respText);
    const respKeys = Object.keys(respJson);

    const itemTemplate = document.getElementById("craft-row").content;
    for (var i = 0; i < respKeys.length; i++) {
        const mtlVals = respJson[respKeys[i]];
        const mtlKeys = Object.keys(mtlVals);
        for (var j = 0; j < mtlKeys.length; j++) {
            var inTable = false;
            for (var k = 1; k < rows.length; k++) {
                if (rows[k].cells[1].innerText === mtlKeys[j]) {
                    rows[k].style = "display: default;";
                    inTable = true;
                    break;
                }
            }
            if (inTable) {
                continue;
            }
            var itemOut = itemTemplate.cloneNode(true);
            itemOut.querySelector("img").src = "data/icons/" + mtlKeys[j].toLowerCase().split(' ').join('') + ".png";
            
            const mtlVal = mtlVals[mtlKeys[j]];
            var mats = mtlVal.mats;
            if (typeof mats !== "undefined") {
                mats = JSON.stringify(mats);
                itemOut.querySelector("tr").setAttribute("mats", mats);
            }

            var itemCols = itemOut.querySelectorAll("td");
            itemCols[1].innerText = mtlKeys[j];
            itemCols[2].innerText = mtlVal.time;
            
            itemCols[5].innerText = mtlVal.value;
            itemCols[10].innerText = mtlVal.level;
            itemCols[12].innerText = respKeys[i];
            
            craftOut.appendChild(itemOut);
            rows = craftOut.querySelectorAll("tr");
        }
    }

    rows = craftOut.querySelectorAll("tr");
    for (var i = 1; i < rows.length; i++) {
        var itemCols = rows[i].cells;
        var matStats = simpleMatsSearch(itemCols[1].innerText, rows);
        const value = parseFloat(itemCols[5].innerText);
        const time = parseFloat(itemCols[2].innerText);
        
        itemCols[3].innerText = matStats.timeMin;
        itemCols[4].innerText = matStats.timeMax;
        itemCols[6].innerText = matStats.goodValue;

        var gpmUnit = value / time;
        gpmUnit = + gpmUnit.toFixed(2);
        itemCols[7].innerText = gpmUnit;
        var gpmMin = value / matStats.timeMin;
        gpmMin = + gpmMin.toFixed(2);
        itemCols[8].innerText = gpmMin;
        var gpmMax = value / matStats.timeMax;
        gpmMax = + gpmMax.toFixed(2);

        itemCols[9].innerText = gpmMax;
        itemCols[11].innerText = matStats.levelMin;
    }
}

function expandCraft(row) {
    const rows = row.parentNode.querySelectorAll("tr");
    const targetItemName = row.cells[1].innerText;

    for (var i = 1; i < rows.length; i++) {
        rows[i].remove();
    }

    const allMats = detailedMatsSearch(targetItemName, rows).reverse();
    console.log(allMats);
    var craftOut = document.getElementById("craft-out");
    for (var i = 0; i < allMats.length; i++) {
        craftOut.appendChild(allMats[i].cloneNode(true));
    }
}

function detailedMatsSearch(searchMtl, rows) {
    var mtls = [];
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].cells[1].innerText === searchMtl) {
            var singleMats = rows[i].getAttribute("mats");
            if (singleMats !== null) {
                var searchMat = JSON.parse(singleMats);
                var searchMatKeys = Object.keys(searchMat);
                var searchMatVals = Object.values(searchMat);
                for (var j = 0; j < searchMatKeys.length; j++) {
                    var recurseMats = detailedMatsSearch(searchMatKeys[j], rows);
                    for (var k = 0; k < searchMatVals[j]; k++) {
                        for (var l = 0; l < recurseMats.length; l++) {
                            mtls.push(recurseMats[l]);
                            console.log(mtls.length);
                        }
                    }
                }
            }
            mtls.push(rows[i]);
        }
    }

    if (mtls.length === 0) {
        return;
    }

    return mtls;
}

function simpleMatsSearch(searchMtl, rows) {
    var mtlStats = new MatStats();
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].cells[1].innerText === searchMtl) {
            var singleMats = rows[i].getAttribute("mats");
            if (singleMats !== null) {
                var searchMat = JSON.parse(singleMats);
                var searchMatKeys = Object.keys(searchMat);
                var searchMatVals = Object.values(searchMat);
                for (var j = 0; j < searchMatKeys.length; j++) {
                    var recurseMats = simpleMatsSearch(searchMatKeys[j], rows);
                    if (recurseMats === undefined) {
                        console.error("Item \"" + searchMatKeys[j] + 
                            "\" could not be found to add to \"" + searchMtl + "\"");
                        return mtlStats;
                    }
                    if (!recurseMats.isBlank()) {
                        recurseMats.multQty(searchMatVals[j])
                        mtlStats.addOther(recurseMats);
                    }
                }
            }

            var singleTime = parseFloat(rows[i].cells[2].innerText);
            mtlStats.timeMax += singleTime;
            mtlStats.goodValue += parseFloat(rows[i].cells[5].innerText);
            if (mtlStats.timeMin < singleTime) {
                mtlStats.timeMin = singleTime;
            }
            var singleLevel = parseFloat(rows[i].cells[10].innerText);
            if (mtlStats.levelMin < singleLevel) {
                mtlStats.levelMin = singleLevel;
            }
        }
    }

    if (mtlStats.isBlank()) {
        return;
    }

    return mtlStats;
}

function addBldgMtl() {
    const itemName = document.getElementById("bldg-mtl-in").value;
    backendRequest("items/exists", itemName, addBldgMtlCallback);
}

function addBldgMtlCallback(respText) {
    if (respText === "false") {
        return;
    }

    var bldgStaging = document.getElementById("bldg-staging");
    const itemName = document.getElementById("bldg-mtl-in").value;
    const itemQty = document.getElementById("bldg-qty-in").value;

    if (bldgStaging.innerText === "") {
        const navHeader = document.getElementById("bldg-staging-navheader").content;
        bldgStaging.appendChild(navHeader.cloneNode(true))
    }

    var itemOut = document.getElementById("bldg-staging-row").content.cloneNode(true);
    itemOut.querySelector("img").src = "data/icons/" + itemName + ".png";

    var itemCols = itemOut.querySelectorAll("td");
    itemCols[1].innerText = itemName;
    itemCols[2].innerText = itemQty;
    
    bldgStaging.appendChild(itemOut);
    document.getElementById("bldg-mtl-in").value = "";
    document.getElementById("bldg-qty-in").value = "1";
}

function removeBldgMtl(btn) {
    var rootPn = btn.parentNode.parentNode;
    
    if (rootPn.parentNode.getElementsByTagName("tr").length === 2) {
        rootPn.parentNode.innerText = "";
    }
    rootPn.remove();
}

function queueBldg() {
    var mtls = {};
    var mtlRows = document.getElementById("bldg-staging").rows;
    for (var i = 1; i < mtlRows.length; i++) {
        var a = mtlRows[i].cells[1].innerText;
        var b = mtlRows[i].cells[2].innerText;
        mtls[a] = b;
    }
    backendRequest("queue/add", JSON.stringify(mtls), queueBldgCallback);
}

function queueBldgCallback(respText) {
    document.getElementById("bldg-staging").innerText = "";
    var queue = document.getElementById("bldg-out");
    const mtlRowTemplate = document.getElementById("bldg-queue-mtl").content;
    const navHeaderTemplate = document.getElementById("bldg-queue-navheader").content;

    const respJson = JSON.parse(respText);
    const respKeys = Object.keys(respJson);

    for (var i = 0; i < respKeys.length; i++) {
        var bldg = document.createElement("tr");
        var rowNavHeader = navHeaderTemplate.cloneNode(true);
        rowNavHeader.querySelector("td").innerText = respKeys[i];
        bldg.appendChild(rowNavHeader);

        const mtlJson = respJson[respKeys[i]];
        const mtlValues = Object.values(mtlJson);
        const mtlKeys = Object.keys(mtlJson);
        for (var j = 0; j < mtlKeys.length; j++) {
            var mtl = mtlRowTemplate.cloneNode(true);
            mtl.querySelector("img").src = "data/icons/" + mtlKeys[j].toLowerCase().split(' ').join('') + ".png";

            var itemCols = mtl.querySelectorAll("td");
            itemCols[1].innerText = mtlKeys[j];
            itemCols[2].innerText = localStorageSearch(mtlKeys[j]) + " / " + mtlValues[j];
            bldg.appendChild(mtl);
        }
        
        var rmBtnDoc = document.getElementById("bldg-queue-all").content.cloneNode(true);
        rmBtnDoc.querySelector("button").setAttribute("uuid", respKeys[i]);
        bldg.appendChild(rmBtnDoc);
        
        queue.appendChild(bldg);
    }
}

function localStorageSearch(itemName) {
    const rows = document.getElementById("storage-out").getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].cells[1].innerText == itemName) {
            return rows[i].cells[2].innerText;
        }
    }
    return 0;
}

function removeBldg(btnElem) {
    backendRequest("queue/remove", btnElem.getAttribute("uuid"), removeBldgCallback);
}

function removeBldgCallback(respText) {
    var rows = document.getElementById("bldg-out").getElementsByTagName("tr");
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].innerHTML.includes(respText)) {
            rows[i].remove();
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
    console.log("\n");
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