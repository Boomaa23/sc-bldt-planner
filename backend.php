<?php

const STORAGE_PATH = "data/storage.json";
const ITEMS_PATH = "data/items.json";

$reqEndpoint = $_GET["endpoint"];
$reqData = $_GET["data"];

if (isset($reqEndpoint) && isset($reqData)) {
    $reqEndpoint = trim(urldecode($reqEndpoint), "/");
    $reqData = urldecode(base64_decode($reqData));
    if (substr_count($reqData, ",") > 0) {
        $reqData = explode(",", $reqData);
    }
    switch ($reqEndpoint) {
        case "storage/get":
            getStoredItems();
            break;
        case "storage/add":
            storeItem($reqData);
            break;
        case "items/search":
            searchItem($reqData);
            break;
    }
}

function getStoredItems() {
    $storage = loadJson(STORAGE_PATH);
    print(json_encode($storage));
}

function storeItem($data) {
    $items = loadJson(ITEMS_PATH);
    $mtlExists = false;
    foreach ($items as $item) {
        if (isset($item[$data[0]])) {
            $mtlExists = true;
            break;
        }
    }
    if ($mtlExists) {
        $storage = loadJson(STORAGE_PATH);
        if (!isset($data[1])) {
            $data[1] = 1;
        }
        if (isset($storage[$data[0]])) {
            if ($data[1] === "+") {
                $storage[$data[0]]++;
            } else if ($data[1] === "-") {
                $storage[$data[0]]--;
            } else {
                $storage[$data[0]] = (int) $data[1];
            }
            if ($storage[$data[0]] === 0) {
                unset($storage[$data[0]]);
            }
        } else if ($data[1] === "+") {
            $storage[$data[0]] = 1;
        } else {
            $storage[$data[0]] = (int) $data[1];
        }
        saveJson(STORAGE_PATH, $storage);

        $prData = [];
        if (isset($storage[$data[0]])) {
            $prData[$data[0]] = $storage[$data[0]];
        } else {
            $prData[$data[0]] = 0;
        }
        print(json_encode($prData));
    } else {
        print("false");
    }
}

function searchItem($name) {
    $matchedItems = [];
    $allItems = loadJson(ITEMS_PATH);
    foreach ($allItems as $bldgName => $mtls) {
        foreach ($mtls as $mtlName => $material) {
            if (str_contains(strtolower($mtlName), strtolower($name))) {
                $matchedItems[$bldgName][$mtlName] = $material;
            }
        }
    }
    if (count($matchedItems) > 0) {
        print(json_encode($matchedItems));
    } else {
        print("false");
    }
}

function loadJson($path) {
    return json_decode(file_get_contents($path), true);
}

function saveJson($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}
?>