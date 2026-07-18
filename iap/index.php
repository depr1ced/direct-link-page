<?php
// Адрес оригинального сервиса прошивки
$target_url = 'https://mrn76.ru/iap/';

// Получаем текущий относительный путь запроса
$request_uri = $_SERVER['REQUEST_URI'];
$position = strpos($request_uri, '/iap/');

if ($position !== false) {
    $relative_path = substr($request_uri, $position + 5); // Отрезаем /iap/
} else {
    $relative_path = ltrim($request_uri, '/');
}

// Формируем финальный URL к оригинальному серверу
$final_url = $target_url . $relative_path;

// Инициализируем cURL для скачивания контента на лету
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $final_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Пробрасываем User-Agent, чтобы сервер не заподозрил бота
if (isset($_SERVER['HTTP_USER_AGENT'])) {
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
}

$response = curl_exec($ch);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// Устанавливаем правильный Content-Type (особенно важно для canvaskit.wasm и JS)
if ($content_type) {
    header("Content-Type: $content_type");
}

// Отдаем контент пользователю
echo $response;
?>
