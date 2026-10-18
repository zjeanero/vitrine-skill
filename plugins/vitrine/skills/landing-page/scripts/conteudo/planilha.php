<?php
// Intermediário opcional para hospedagem com PHP: busca a aba publicada no Google e guarda uma cópia
// por 10 minutos. O site fica mais rápido e, se o Google não responder, usa a última cópia boa.
// No HTML, aponte as abas para cá:
//   window.PLANILHAS = { informacoes: 'planilha.php?aba=informacoes', cardapio: 'planilha.php?aba=cardapio' };

$PLANILHAS = [
    'informacoes' => 'https://docs.google.com/spreadsheets/d/e/COLE-AQUI/pub?gid=0&single=true&output=csv',
    // 'cardapio' => 'https://docs.google.com/spreadsheets/d/e/COLE-AQUI/pub?gid=123456&single=true&output=csv',
];
$VALIDADE = 600; // segundos

$aba = $_GET['aba'] ?? '';
if (!isset($PLANILHAS[$aba])) {
    http_response_code(404);
    exit;
}

$pasta = __DIR__ . '/cache';
if (!is_dir($pasta)) {
    @mkdir($pasta, 0755, true);
    @file_put_contents($pasta . '/.htaccess', "Require all denied\n");
}
$arquivo = $pasta . '/' . $aba . '.csv';

if (!is_file($arquivo) || time() - filemtime($arquivo) > $VALIDADE) {
    $csv = baixar($PLANILHAS[$aba]);
    if ($csv !== null && trim($csv) !== '' && stripos($csv, '<html') === false) {
        file_put_contents($arquivo, $csv, LOCK_EX);
    } elseif (is_file($arquivo)) {
        touch($arquivo); // Google fora do ar: segue com a cópia antiga e tenta de novo depois da validade
    }
}

header('Content-Type: text/csv; charset=utf-8');
header('Cache-Control: public, max-age=120');
if (is_file($arquivo)) {
    readfile($arquivo);
} else {
    http_response_code(503);
}

function baixar(string $url): ?string
{
    if (function_exists('curl_init')) {
        $c = curl_init($url);
        curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true, CURLOPT_TIMEOUT => 6]);
        $r = curl_exec($c);
        $ok = $r !== false && curl_getinfo($c, CURLINFO_HTTP_CODE) === 200;
        curl_close($c);
        return $ok ? $r : null;
    }
    $r = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 6]]));
    return $r === false ? null : $r;
}
