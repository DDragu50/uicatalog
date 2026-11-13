<?php
// contact.php
//
// CONTACT ENDPOINT FOR APACHE HOSTING WITH PHP (cPanel).
// The same contract as server/contactHandler.js (Node.js): receives a contact message (POST api/contact, JSON), validates it
// with the same rules, limits how often one visitor can send, and sends it by e-mail to CONTACT_TO.
// Answers: 200 { ok:true } · 400 { ok:false, errorLabel:'VALIDATION', errors:[ { name, errorLabel, values } ] }
//          400/405/413/415 { ok:false, errorLabel:'INVALID_REQUEST' } · 429 TOO_MANY_REQUESTS · 500 SERVER_ERROR.
// Settings: the two addresses below. CONTACT_TO must exist in cPanel (Email Accounts or Forwarders); CONTACT_FROM must be an
// address of this domain, so that the receiving servers accept the message.

const CONTACT_TO = 'admin@uicatalog.eu';
const CONTACT_FROM = 'no-reply@uicatalog.eu';
const CONTACT_FROM_NAME = 'UI Catalog contact form';

// Same limits as server/serverConfig.js (CONTACT_RULES) and client/app/appConfig.js (APP_CONFIG.contact); the e-mail
// pattern also refuses < > , ; " ( ) \ so that the address is safe in the Reply-To header.
const MAX_BODY_BYTES = 20000;
const RATE_LIMIT_WINDOW_SECONDS = 15 * 60;
const RATE_LIMIT_MAX = 5;
const FIELDS = [
    'name'    => [ 'mandatory' => true,  'maxLength' => 100 ],
    'email'   => [ 'mandatory' => true,  'maxLength' => 254, 'pattern' => '/^[^\s@<>,;"()\\\\]+@[^\s@<>,;"()\\\\]+\.[^\s@<>,;"()\\\\]+$/u' ],
    'subject' => [ 'mandatory' => false, 'maxLength' => 150 ],
    'message' => [ 'mandatory' => true,  'minLength' => 10, 'maxLength' => 5000 ]
];

// Folder for the rate-limit records and for messages that could not be sent: outside the public folder when possible.
function storageDir()
{
    $outside = dirname(__DIR__, 2) . '/uicatalog-contact';
    foreach ( [ $outside, sys_get_temp_dir() . '/uicatalog-contact' ] as $dir )
    {
        if ( is_dir($dir) || @mkdir($dir, 0700, true) ) { if ( is_writable($dir) ) { return $dir; } }
    }
    return null;
}

// Sends a JSON answer with the given status and stops.
function sendJSON( $status, $payload )
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// Length in characters (as in JavaScript for ordinary text).
function textLength( $value ) { return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : preg_match_all('/./su', $value); }

// Validates one field against its rule; returns an error [ name, errorLabel, values ] or null.
function validateField( $name, $value, $rule )
{
    if ( $value === '' ) { return $rule['mandatory'] ? [ 'name' => $name, 'errorLabel' => 'REQUIRED', 'values' => new stdClass() ] : null; }
    $length = textLength($value);
    if ( isset($rule['maxLength']) && $length > $rule['maxLength'] ) { return [ 'name' => $name, 'errorLabel' => 'MAX_LENGTH', 'values' => [ 'maxLength' => $rule['maxLength'] ] ]; }
    if ( isset($rule['minLength']) && $length < $rule['minLength'] ) { return [ 'name' => $name, 'errorLabel' => 'MIN_LENGTH', 'values' => [ 'minLength' => $rule['minLength'] ] ]; }
    if ( isset($rule['pattern']) && !preg_match($rule['pattern'], $value) ) { return [ 'name' => $name, 'errorLabel' => 'INVALID_EMAIL', 'values' => new stdClass() ]; }
    return null;
}

// Returns whether this visitor may send now and records the attempt when allowed (one small file per visitor).
function allowVisitor( $dir, $visitor, $now )
{
    if ( $dir === null ) { return true; }
    $file = $dir . '/rate-' . hash('sha256', $visitor) . '.json';
    $handle = @fopen($file, 'c+');
    if ( !$handle ) { return true; }
    flock($handle, LOCK_EX);
    $times = json_decode(stream_get_contents($handle) ?: '[]', true);
    $recent = array_values(array_filter(is_array($times) ? $times : [], fn( $time ) => $now - $time < RATE_LIMIT_WINDOW_SECONDS));
    $allowed = count($recent) < RATE_LIMIT_MAX;
    if ( $allowed ) { $recent[] = $now; }
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($recent));
    flock($handle, LOCK_UN);
    fclose($handle);
    return $allowed;
}

// Encodes a header text (name, subject) for e-mail: no line breaks, UTF-8 allowed.
function encodeHeader( $text ) { return '=?UTF-8?B?' . base64_encode(str_replace([ "\r", "\n" ], ' ', $text)) . '?='; }

// Sends the message by e-mail; returns true when the mail server accepted it.
function sendMail( $message, $receivedAt )
{
    $subject = $message['subject'] !== '' ? $message['subject'] : 'Message from the contact form';
    $body = "Name: {$message['name']}\nE-mail: {$message['email']}\nReceived: {$receivedAt}\n\n{$message['message']}\n";
    $headers = [
        'From: ' . encodeHeader(CONTACT_FROM_NAME) . ' <' . CONTACT_FROM . '>',
        'Reply-To: ' . encodeHeader($message['name']) . ' <' . $message['email'] . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64'
    ];
    return mail(CONTACT_TO, encodeHeader('[UI Catalog] ' . $subject), chunk_split(base64_encode($body)), implode("\r\n", $headers), '-f' . CONTACT_FROM);
}

// --- request ---
if ( ( $_SERVER['REQUEST_METHOD'] ?? '' ) !== 'POST' ) { header('Allow: POST'); sendJSON(405, [ 'ok' => false, 'errorLabel' => 'INVALID_REQUEST' ]); }
if ( stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0 ) { sendJSON(415, [ 'ok' => false, 'errorLabel' => 'INVALID_REQUEST' ]); }
$text = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ( $text === false || strlen($text) > MAX_BODY_BYTES ) { sendJSON(413, [ 'ok' => false, 'errorLabel' => 'INVALID_REQUEST' ]); }
$body = json_decode($text, true);
if ( !is_array($body) ) { sendJSON(400, [ 'ok' => false, 'errorLabel' => 'INVALID_REQUEST' ]); }

$message = [];
$errors = [];
foreach ( FIELDS as $name => $rule )
{
    $value = isset($body[$name]) && is_string($body[$name]) ? trim(preg_replace('/\r\n?/', "\n", $body[$name])) : '';
    if ( $name !== 'message' ) { $value = str_replace("\n", ' ', $value); }
    $message[$name] = $value;
    $error = validateField($name, $value, $rule);
    if ( $error ) { $errors[] = $error; }
}
if ( $errors ) { sendJSON(400, [ 'ok' => false, 'errorLabel' => 'VALIDATION', 'errors' => $errors ]); }

$dir = storageDir();
$now = time();
if ( !allowVisitor($dir, $_SERVER['REMOTE_ADDR'] ?? 'unknown', $now) ) { sendJSON(429, [ 'ok' => false, 'errorLabel' => 'TOO_MANY_REQUESTS' ]); }

$receivedAt = gmdate('Y-m-d\TH:i:s\Z', $now);
if ( sendMail($message, $receivedAt) ) { sendJSON(200, [ 'ok' => true ]); }

// The mail server refused: keep the message so that it is not lost, and tell the visitor it was not sent.
if ( $dir !== null ) { @file_put_contents($dir . '/unsent-' . gmdate('Ymd-His', $now) . '-' . bin2hex(random_bytes(4)) . '.json', json_encode([ 'receivedAt' => $receivedAt ] + $message, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); }
error_log('UI Catalog contact: mail() failed for a message received at ' . $receivedAt);
sendJSON(500, [ 'ok' => false, 'errorLabel' => 'SERVER_ERROR' ]);
