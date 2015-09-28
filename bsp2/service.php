<?php

header('Acces-Control-Allow-Origin: *');
header('Acces-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers', 'accept, origin, content-type');

require_once '../vendor/autoload.php';

use Slim\Slim;

$app = new Slim();

$app->get('/', 'index');
//Alle Links abfragen
$app->get('/links', 'getLinks');
//Ein Link abfragen mit Id
$app->get('/links/:id', 'getLinks');
//Links durchsuchen
$app->get('/links/search/:query', 'findByName');
//Link einfügen
$app->post('/links', 'addLink');
//Link ändern
$app->put('/links/:id', 'updateLink');
//Link löschen
$app->post('/linkss/:id', 'deleteLink');


//deklaration für Anfrage mit Methode OPTIONS
$app->run();

function index() {
  echo 'auf der Index Seite';
}

function getLinks($id = null) {
  if (!$id) {
    echo 'jjj';
  }else {
    echo $id;
  }
}

function findByName($id) {
  
}

function addLink() {
  
}

function updateLink($id) {
  
}

function deleteLink($id) {
  
}

?>