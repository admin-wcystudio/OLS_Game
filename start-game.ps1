$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$preferred = 8083
$port = $preferred
$slug = "ols"
$prefix = $null
$listener = $null
$tryPorts = @()
for ($tryPort = $preferred; $tryPort -le 8099; $tryPort++) { $tryPorts += $tryPort }
for ($tryPort = 8080; $tryPort -lt $preferred; $tryPort++) { $tryPorts += $tryPort }
foreach ($tryPort in $tryPorts) {
    $candidate = "http://localhost:$tryPort/$slug/"
    $tryListener = New-Object System.Net.HttpListener
    $tryListener.Prefixes.Add($candidate)
    try {
        $tryListener.Start()
        $port = $tryPort
        $prefix = $candidate
        $listener = $tryListener
        break
    } catch {
        $tryListener.Close()
    }
}

if (-not $listener) {
    Write-Host "開唔到 http://localhost:8080/ 到 8099"
    Write-Host "呢啲 port 已經有人用緊。請關閉其他遊戲視窗後再試。"
    Read-Host "按 Enter 關閉"
    exit 1
}

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'text/javascript; charset=utf-8'
    '.mjs'  = 'text/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.gif'  = 'image/gif'
    '.webp' = 'image/webp'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
    '.mp3'  = 'audio/mpeg'
    '.mp4'  = 'video/mp4'
    '.webm' = 'video/webm'
    '.mov'  = 'video/quicktime'
    '.wav'  = 'audio/wav'
    '.woff' = 'font/woff'
    '.woff2'= 'font/woff2'
    '.ttf'  = 'font/ttf'
}

Write-Host "OLS Game 已啟動：$prefix"
Write-Host "請唔好關閉呢個視窗。要結束遊戲時，喺呢度按 Ctrl+C。"
Start-Process $prefix

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.LocalPath.TrimStart('/'))
    $slugPrefix = "$slug/"
    if ($requestPath -eq $slug -or $requestPath -eq $slugPrefix) {
        $requestPath = 'index.html'
    } elseif ($requestPath.StartsWith($slugPrefix)) {
        $requestPath = $requestPath.Substring($slugPrefix.Length)
        if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }
    } else {
        $context.Response.StatusCode = 404
        $context.Response.Close()
        continue
    }

    $fullPath = [System.IO.Path]::GetFullPath((Join-Path $root $requestPath))
    $rootFull = [System.IO.Path]::GetFullPath($root)
    if (-not $fullPath.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
    }

    if (Test-Path $fullPath -PathType Container) {
        $fullPath = Join-Path $fullPath 'index.html'
    }

    if (-not (Test-Path $fullPath -PathType Leaf)) {
        $context.Response.StatusCode = 404
        $context.Response.Close()
        continue
    }

    $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $context.Response.ContentType = $(if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' })
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.AddHeader('Cache-Control', 'no-store')
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
}
