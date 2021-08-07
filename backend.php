<?php

// Backend for sc-bldt-planner
// Response body consists of print statements

const STORAGE_PATH = "data/storage.json";
const ITEMS_PATH = "data/items.json";
const QUEUE_PATH = "data/queue.json";

$reqEndpoint = $_GET["endpoint"];
$reqData = $_GET["data"];

if (isset($reqEndpoint) && isset($reqData)) {
    $reqEndpoint = trim(urldecode($reqEndpoint), "/");
    $reqData = urldecode(base64_decode($reqData));
    if (substr_count($reqData, ",") > 0) {
        $arrData = explode(",", $reqData);
    }
    switch ($reqEndpoint) {
        case "storage/get":
            $storage = loadJson(STORAGE_PATH);
            if ($reqData !== "") {
                $storage = $storage[$reqData];
            }
            print(json_encode($storage));
            break;
        case "storage/add":
            storeItem($arrData);
            break;
        case "items/get":
            $allItems = loadJson(ITEMS_PATH);
            print(json_encode($allItems));
            break;
        case "items/search":
            searchItem($reqData);
            break;
        case "items/exists":
            $mtlExists = materialExists(loadJson(ITEMS_PATH), $reqData);
            print($reqData !== "" && $mtlExists ? "true" : "false");
            break;
        case "queue/get":
            $queue = loadJson(QUEUE_PATH);
            print(json_encode($queue));
            break;
        case "queue/add":
            queueAdd($reqData);
            break;
        case "queue/remove":
            queueRemove($reqData);
            break;
    }
}

function storeItem($data) {
    if (materialExists(loadJson(ITEMS_PATH), $data[0])) {
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

function materialExists($validItems, $mtl) {
    $mtlExists = false;
    foreach ($validItems as $item) {
        if (isset($item[$mtl])) {
            $mtlExists = true;
            break;
        }
    }
    return $mtlExists;
}

function searchItem($name) {
    $matchedItems = [];
    $allItems = loadJson(ITEMS_PATH);
    foreach ($allItems as $bldgName => $mtls) {
        foreach ($mtls as $mtlName => $material) {
            if (str_contains(strtolower($mtlName), strtolower($name))) {
                array_push($matchedItems, $mtlName);
            }
        }
    }
    if (count($matchedItems) > 0) {
        print(json_encode($matchedItems));
    } else {
        print("false");
    }
}

function queueAdd($data) {
    $bldgQueue = loadJson(QUEUE_PATH);
    $jsonData = json_decode($data);
    $bldg = [];
    foreach ($jsonData as $mtlName => $mtlQty) {
        $bldg[$mtlName] = (int) $mtlQty;
    }
    $uuid = generateRandomString(4);
    $bldgQueue[$uuid] = $bldg;
    saveJson(QUEUE_PATH, $bldgQueue);
    $respArr = [];
    $respArr[$uuid] = $bldg;
    print(json_encode($respArr));
}

function queueRemove($uuid) {
    $bldgQueue = loadJson(QUEUE_PATH);
    unset($bldgQueue[$uuid]);
    saveJson(QUEUE_PATH, $bldgQueue);
    print($uuid);
}

function loadJson($path) {
    return json_decode(file_get_contents($path), true);
}

function saveJson($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT));
}

function generateRandomString($length) {
	return substr(str_shuffle(str_repeat($x='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' , ceil($length/strlen($x)) )),1,$length);
}
?>