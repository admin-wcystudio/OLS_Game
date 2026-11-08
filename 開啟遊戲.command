#!/bin/bash
cd "$(dirname "$0")" || exit 1
GAME_NAME="OLS Game"

echo "正在開啟 ${GAME_NAME}..."
echo "瀏覽器會自動打開。請唔好關閉呢個視窗。"
echo

if [ ! -x /usr/bin/perl ]; then
  echo "呢部 Mac 開唔到遊戲。"
  read -r -p "按 Enter 關閉"
  exit 1
fi

PORT=""
try=8083
while [ -z "$PORT" ] && [ "$try" -le 8099 ]; do
  if ! /usr/sbin/lsof -nP -iTCP:"$try" -sTCP:LISTEN >/dev/null 2>&1; then
    PORT="$try"
    break
  fi
  try=$((try + 1))
done
try=8080
while [ -z "$PORT" ] && [ "$try" -lt 8083 ]; do
  if ! /usr/sbin/lsof -nP -iTCP:"$try" -sTCP:LISTEN >/dev/null 2>&1; then
    PORT="$try"
    break
  fi
  try=$((try + 1))
done

if [ -z "$PORT" ]; then
  echo "開唔到 http://127.0.0.1:8080/ 到 8099"
  echo "呢啲 port 已經有人用緊。請關閉其他遊戲視窗後再試。"
  read -r -p "按 Enter 關閉"
  exit 1
fi

URL="http://127.0.0.1:${PORT}/ols/"
echo "${GAME_NAME} 已啟動：${URL}"
echo "請唔好關閉呢個視窗。要結束遊戲時，喺呢度按 Control+C。"
exec /usr/bin/perl -x "$0" "$PORT" "$PWD" "$URL" "ols"

#!perl
use strict;
use warnings;
use IO::Socket::INET;
use Cwd 'abs_path';
use File::Spec;

my ($port, $root_arg, $url, $slug) = @ARGV;
my $root = abs_path($root_arg);
if (!$root || !-d $root) {
    print STDERR "開唔到遊戲資料夾。\n";
    exit 1;
}

my %mime = (
    '.html' => 'text/html; charset=utf-8',
    '.js'   => 'text/javascript; charset=utf-8',
    '.mjs'  => 'text/javascript; charset=utf-8',
    '.css'  => 'text/css; charset=utf-8',
    '.json' => 'application/json; charset=utf-8',
    '.map'  => 'application/json; charset=utf-8',
    '.txt'  => 'text/plain; charset=utf-8',
    '.xml'  => 'application/xml; charset=utf-8',
    '.png'  => 'image/png',
    '.jpg'  => 'image/jpeg',
    '.jpeg' => 'image/jpeg',
    '.gif'  => 'image/gif',
    '.webp' => 'image/webp',
    '.svg'  => 'image/svg+xml',
    '.ico'  => 'image/x-icon',
    '.mp3'  => 'audio/mpeg',
    '.mp4'  => 'video/mp4',
    '.webm' => 'video/webm',
    '.mov'  => 'video/quicktime',
    '.wav'  => 'audio/wav',
    '.ogg'  => 'audio/ogg',
    '.bin'  => 'application/octet-stream',
    '.woff' => 'font/woff',
    '.woff2'=> 'font/woff2',
    '.ttf'  => 'font/ttf',
    '.otf'  => 'font/otf',
    '.wasm' => 'application/wasm',
);

sub url_decode {
    my ($s) = @_;
    return '' if !defined $s;
    $s =~ tr/+/ /;
    $s =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/eg;
    return $s;
}

sub mime_for {
    my ($path) = @_;
    my ($ext) = $path =~ /(\.[^.\/]+)$/;
    return 'application/octet-stream' if !$ext;
    return $mime{lc $ext} || 'application/octet-stream';
}

sub send_status {
    my ($client, $code, $text) = @_;
    my $body = "$code $text\n";
    my $msg = "HTTP/1.1 $code $text\r\n"
        . "Content-Type: text/plain; charset=utf-8\r\n"
        . "Content-Length: " . length($body) . "\r\n"
        . "Connection: close\r\n\r\n"
        . $body;
    syswrite($client, $msg);
}

sub handle {
    my ($client) = @_;
    binmode($client);
    my $req = '';
    local $SIG{ALRM} = sub { die "timeout\n" };
    eval {
        alarm(8);
        while ($req !~ /\r\n\r\n/ && length($req) < 16384) {
            my $n = sysread($client, my $buf, 4096);
            last if !defined $n || $n == 0;
            $req .= $buf;
        }
        alarm(0);
    };
    alarm(0);
    return if $@ || $req !~ m{\A([A-Z]+)\s+(\S+)};
    my ($method, $target) = ($1, $2);
    if ($method ne 'GET' && $method ne 'HEAD') {
        send_status($client, 405, 'Method Not Allowed');
        return;
    }
    my ($path_only) = split /\?/, $target, 2;
    $path_only = url_decode($path_only);
    if (index($path_only, "\0") >= 0 || $path_only !~ m{\A/} || $path_only =~ m{(^|/)\.\.($|/)}) {
        send_status($client, 403, 'Forbidden');
        return;
    }
    $path_only =~ s{//+}{/}g;
    my $game_prefix = "/$slug/";
    if ($path_only eq '/' || $path_only eq '/index.html' || $path_only eq "/$slug") {
        my $redir = "HTTP/1.1 302 Found\r\nLocation: $game_prefix\r\nCache-Control: no-store\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        syswrite($client, $redir);
        return;
    }
    if (index($path_only, $game_prefix) != 0) {
        send_status($client, 404, 'Not Found');
        return;
    }
    $path_only = substr($path_only, length($game_prefix) - 1);
    $path_only = '/index.html' if $path_only eq '' || $path_only eq '/';
    my $rel = $path_only;
    $rel =~ s{\A/}{};
    $rel .= 'index.html' if $rel eq '' || substr($rel, -1) eq '/';
    my @parts = split m{/}, $rel;
    return send_status($client, 403, 'Forbidden') if grep { $_ eq '..' || $_ eq '' } @parts;
    my $full = File::Spec->catfile($root, @parts);
    my $abs = abs_path($full);
    if (!$abs || ($abs ne $root && index($abs, $root . '/') != 0) || !-f $abs || !-r $abs) {
        send_status($client, 404, 'Not Found');
        return;
    }
    open my $fh, '<:raw', $abs or return send_status($client, 404, 'Not Found');
    my $size = -s $fh;
    $size = 0 if !defined $size;
    my $header = "HTTP/1.1 200 OK\r\n"
        . "Content-Type: " . mime_for($abs) . "\r\n"
        . "Content-Length: $size\r\n"
        . "Cache-Control: no-store\r\n"
        . "Connection: close\r\n\r\n";
    syswrite($client, $header);
    if ($method eq 'GET') {
        while (1) {
            my $n = read($fh, my $buf, 65536);
            last if !defined $n || $n == 0;
            my $off = 0;
            while ($off < length($buf)) {
                my $w = syswrite($client, $buf, length($buf) - $off, $off);
                last if !defined $w || $w == 0;
                $off += $w;
            }
        }
    }
    close $fh;
}

my $server = IO::Socket::INET->new(
    LocalHost => '127.0.0.1',
    LocalPort => $port,
    Proto     => 'tcp',
    Listen    => 64,
    Reuse     => 1,
);
if (!$server) {
    print STDERR "開唔到 $url\n";
    exit 1;
}

if (-d '/Applications/Google Chrome.app') {
    system('open', '-a', 'Google Chrome', $url);
} else {
    system('open', $url);
}

$SIG{CHLD} = 'IGNORE';
while (my $client = $server->accept()) {
    my $pid = fork();
    if (!defined $pid) {
        handle($client);
        close $client;
        next;
    }
    if ($pid == 0) {
        close $server;
        handle($client);
        close $client;
        exit 0;
    }
    close $client;
}
