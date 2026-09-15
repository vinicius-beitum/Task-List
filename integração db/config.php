<?php
$dbHost = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbName = "task_list_db";

$conexao = new mysqli($dbHost, $dbUsername, $dbPassword, $dbName);

if ($conexao->connect_error) {
	die("Falha na conexão com o banco de dados.");
}

$conexao->set_charset("utf8mb4");
?>