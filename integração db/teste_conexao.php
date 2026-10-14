
<?php

require_once __DIR__ . '/conexao.php';

try {
    $resultado = $pdo->query('SELECT DATABASE() AS banco')
                     ->fetch();

    echo '<h1>Tasklist</h1>';
    echo '<p>Conexão com o MySQL realizada com sucesso!</p>';
    echo '<p>Banco conectado: ' .
         htmlspecialchars($resultado['banco'], ENT_QUOTES, 'UTF-8') .
         '</p>';

} catch (PDOException $e) {
    error_log('Erro no teste de conexão: ' . $e->getMessage());

    http_response_code(500);
    echo 'Não foi possível realizar o teste.';
}
