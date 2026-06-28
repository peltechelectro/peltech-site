<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$name    = htmlspecialchars(trim($data['name']    ?? ''), ENT_QUOTES, 'UTF-8');
$phone   = htmlspecialchars(trim($data['phone']   ?? ''), ENT_QUOTES, 'UTF-8');
$email   = filter_var(trim($data['email']  ?? ''), FILTER_SANITIZE_EMAIL);
$type    = htmlspecialchars(trim($data['type']    ?? ''), ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars(trim($data['message'] ?? ''), ENT_QUOTES, 'UTF-8');

if (!$name || !$phone) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$to      = 'office@peltech.ro';
$subject = '=?UTF-8?B?' . base64_encode('Cerere ofertă nouă — PELTECH') . '?=';

$body  = "Cerere ofertă nouă prin site\n";
$body .= "================================\n";
$body .= "Nume:         $name\n";
$body .= "Telefon:      $phone\n";
if ($email)   $body .= "Email:        $email\n";
if ($type)    $body .= "Tip lucrare:  $type\n";
if ($message) $body .= "\nMesaj:\n$message\n";

$replyTo = $email ?: 'noreply@peltech.ro';
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: Site PELTECH <office@peltech.ro>',
    "Reply-To: $replyTo",
]);

$ok = mail($to, $subject, $body, $headers);
echo json_encode(['ok' => $ok]);
