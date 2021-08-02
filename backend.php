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
        case "storage/add":
            storeItem($reqData);
            break;
        case "storage/remove":
            removeItem($reqData);
            break;
        case "items/search":
            searchItem($reqData);
            break;
    }
    // println($reqEndpoint);
    // if (is_array($reqData)) {
    //     $reqData = implode(", ", $reqData);
    // }
    // println($reqData);
}

function storeItem($data) {
    $storage = loadJson(STORAGE_PATH);
    $storage[$data[0]] = (int) $data[1];
    saveJson(STORAGE_PATH, $storage);
}

function removeItem($name) {
    $storage = loadJson(STORAGE_PATH);
    unset($storage[$name]);
    saveJson(STORAGE_PATH, $storage);
}

function searchItem($name) {
    $matchedItems = [];
    $allItems = loadJson(ITEMS_PATH);
    foreach ($allItems as $bldgName => $mtls) {
        foreach ($mtls as $mtlName => $material) {
            if (str_contains(strtolower($mtlName), strtolower($name))) {
                $matchedItems[$mtlName] = $material;
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

function println($str) {
    print($str);
    print("\n");
}
?>