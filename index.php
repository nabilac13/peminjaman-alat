<?php
$alat = [
    [
        'id' => 1,
        'nama' => 'Kamera Canon EOS 90D',
        'kategori' => 'Kamera',
        'stok' => 4,
        'dipinjam' => 2,
        'ikon' => '📷',
        'warna' => 'camera',
        'deskripsi' => 'Kamera DSLR untuk dokumentasi dan produksi konten.',
        'label' => 'Populer',
    ],
    [
        'id' => 2,
        'nama' => 'Laptop ASUS Vivobook',
        'kategori' => 'Komputer',
        'stok' => 6,
        'dipinjam' => 3,
        'ikon' => '💻',
        'warna' => 'laptop',
        'deskripsi' => 'Laptop untuk presentasi, desain, dan kebutuhan kerja.',
        'label' => '',
    ],
    [
        'id' => 3,
        'nama' => 'Proyektor Epson EB-E01',
        'kategori' => 'Elektronik',
        'stok' => 3,
        'dipinjam' => 1,
        'ikon' => '📽️',
        'warna' => 'projector',
        'deskripsi' => 'Proyektor jernih untuk rapat dan kegiatan acara.',
        'label' => 'Tersedia',
    ],
    [
        'id' => 4,
        'nama' => 'Tripod Kamera',
        'kategori' => 'Kamera',
        'stok' => 5,
        'dipinjam' => 2,
        'ikon' => '🎥',
        'warna' => 'tripod',
        'deskripsi' => 'Tripod kokoh dengan tinggi yang dapat disesuaikan.',
        'label' => '',
    ],
    [
        'id' => 5,
        'nama' => 'Microphone Wireless',
        'kategori' => 'Audio',
        'stok' => 4,
        'dipinjam' => 1,
        'ikon' => '🎙️',
        'warna' => 'audio',
        'deskripsi' => 'Mikrofon nirkabel untuk wawancara dan presentasi.',
        'label' => '',
    ],
    [
        'id' => 6,
        'nama' => 'Speaker Portable JBL',
        'kategori' => 'Audio',
        'stok' => 3,
        'dipinjam' => 2,
        'ikon' => '🔊',
        'warna' => 'speaker',
        'deskripsi' => 'Speaker portabel untuk mendukung kegiatan bersama.',
        'label' => '',
    ],
];
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f6f8fc">
    <title>Pinjam.in — Peminjaman Alat</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        :root { color-scheme: light; }
        body { font-family: "DM Sans", ui-sans-serif, system-ui, sans-serif; }
        .soft-grid { background-image: radial-gradient(#dbe5f5 .8px, transparent .8px); background-size: 17px 17px; }
        .scrollbar-hide { scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        dialog::backdrop { background: rgb(15 23 42 / .42); backdrop-filter: blur(3px); }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-9px) rotate(-4deg); } }
        .float-box { animation: float 4s ease-in-out infinite; }
    </style>
</head>
<body class="min-h-screen bg-[#f6f8fc] text-slate-800 antialiased">
    <div id="root"></div>
    <script>
        window.initialEquipment = <?= json_encode($alat, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE) ?>;
    </script>
    <script type="text/babel" src="app.jsx"></script>
</body>
</html>
