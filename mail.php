<?php
/* ─────────────────────────────────────────────────────────────
   Serenity Yachting Club — обробник форм (contact + review)
   Надсилає заявки на робочі пошти через PHP mail().
   Працює на HostIQ / будь-якому cPanel-хостингу з PHP.
   ───────────────────────────────────────────────────────────── */

header('Content-Type: application/json; charset=utf-8');

// ── куди надсилати (обидві робочі пошти) ──
$RECIPIENTS = 'mykola@serenityyachting.club, office@serenityyachting.club';
$DOMAIN     = 'serenityyachting.club';
$FROM       = 'no-reply@' . $DOMAIN;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// ── анти-спам: приховане поле-пастка ──
if (!empty($_POST['company'])) {
    echo json_encode(['ok' => true]); // тихо "приймаємо" ботів
    exit;
}

function oneline($s) { return trim(str_replace(["\r", "\n"], ' ', (string) $s)); }

$type    = $_POST['_type'] ?? 'contact';
$contact = null;

if ($type === 'review') {
    $name   = oneline($_POST['name'] ?? '');
    $rating = oneline($_POST['rating'] ?? '');
    $text   = trim($_POST['text'] ?? '');
    if ($name === '' || $text === '') {
        echo json_encode(['ok' => false, 'error' => 'Заповніть імʼя та текст відгуку']);
        exit;
    }
    $subject = 'Новий відгук на модерацію — ' . $name;
    $body    = "Новий відгук зі сайту (на модерацію):\n\n"
             . "Імʼя: $name\n"
             . 'Оцінка: ' . ($rating !== '' ? $rating . '/5' : '—') . "\n\n"
             . "Відгук:\n" . $text . "\n";
} else {
    $name    = oneline($_POST['name'] ?? '');
    $contact = oneline($_POST['contactline'] ?? '');
    $voyage  = oneline($_POST['voyage'] ?? '');
    $message = trim($_POST['message'] ?? '');
    if ($name === '' || $contact === '') {
        echo json_encode(['ok' => false, 'error' => 'Заповніть імʼя та контакт']);
        exit;
    }
    $subject = 'Запит на звʼязок — ' . $name;
    $body    = "Новий запит зі сайту:\n\n"
             . "Імʼя: $name\n"
             . "Телефон / Telegram / email: $contact\n"
             . 'Напрям: ' . ($voyage !== '' ? $voyage : '—') . "\n"
             . 'Побажання: ' . ($message !== '' ? $message : '—') . "\n";
}

// ── заголовки ──
$headers   = [];
$headers[] = 'From: Serenity Yachting Club <' . $FROM . '>';
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
if ($contact !== null && filter_var($contact, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $contact; // відповідати одразу гостю, якщо лишив email
}

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail($RECIPIENTS, $encodedSubject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Не вдалося надіслати лист. Напишіть нам, будь ласка, у Telegram.']);
}
