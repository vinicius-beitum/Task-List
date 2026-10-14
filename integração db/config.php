
<?php

$host = '127.0.0.1';
$banco = 'tasklist_db';
$usuario = 'root';
$senha = ''; 

$dsn = "mysql:host=$host;dbname=$banco;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

} catch (PDOException $e) {
    error_log("Erro de conexão com o banco: " . $e->getMessage());

    http_response_code(500);
    exit('Não foi possível conectar ao banco de dados.');
}
