CREATE DATABASE IF NOT EXISTS peminjaman_alat
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE peminjaman_alat;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'petugas', 'peminjam') NOT NULL DEFAULT 'peminjam',
    status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS kategori (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alat (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kategori_id BIGINT UNSIGNED NOT NULL,
    kode_alat VARCHAR(30) NOT NULL UNIQUE,
    nama VARCHAR(120) NOT NULL,
    deskripsi TEXT,
    stok_total INT UNSIGNED NOT NULL DEFAULT 0,
    kondisi ENUM('baik', 'rusak', 'perawatan') NOT NULL DEFAULT 'baik',
    status ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alat_kategori
        FOREIGN KEY (kategori_id) REFERENCES kategori(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_alat_nama (nama),
    INDEX idx_alat_kategori (kategori_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS peminjaman (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_peminjaman VARCHAR(30) NOT NULL UNIQUE,
    peminjam_id BIGINT UNSIGNED NOT NULL,
    disetujui_oleh BIGINT UNSIGNED,
    tanggal_pengajuan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tanggal_rencana_pinjam DATE NOT NULL,
    tanggal_rencana_kembali DATE NOT NULL,
    tanggal_disetujui DATETIME,
    tanggal_diambil DATETIME,
    status ENUM(
        'menunggu_persetujuan',
        'disetujui',
        'ditolak',
        'dipinjam',
        'menunggu_verifikasi_pengembalian',
        'selesai',
        'dibatalkan'
    ) NOT NULL DEFAULT 'menunggu_persetujuan',
    catatan_peminjam TEXT,
    catatan_petugas TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_peminjaman_peminjam
        FOREIGN KEY (peminjam_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_peminjaman_petugas
        FOREIGN KEY (disetujui_oleh) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_peminjaman_peminjam (peminjam_id),
    INDEX idx_peminjaman_status (status),
    INDEX idx_peminjaman_tanggal (tanggal_pengajuan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detail_peminjaman (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    peminjaman_id BIGINT UNSIGNED NOT NULL,
    alat_id BIGINT UNSIGNED NOT NULL,
    jumlah INT UNSIGNED NOT NULL,
    catatan TEXT,
    CONSTRAINT fk_detail_peminjaman_header
        FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detail_peminjaman_alat
        FOREIGN KEY (alat_id) REFERENCES alat(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_detail_peminjaman_alat UNIQUE (peminjaman_id, alat_id),
    CONSTRAINT chk_detail_jumlah CHECK (jumlah > 0),
    INDEX idx_detail_alat (alat_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pengembalian (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    peminjaman_id BIGINT UNSIGNED NOT NULL UNIQUE,
    diverifikasi_oleh BIGINT UNSIGNED,
    tanggal_pengajuan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tanggal_verifikasi DATETIME,
    status ENUM('menunggu_verifikasi', 'diterima', 'ditolak')
        NOT NULL DEFAULT 'menunggu_verifikasi',
    catatan_peminjam TEXT,
    catatan_petugas TEXT,
    CONSTRAINT fk_pengembalian_peminjaman
        FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pengembalian_petugas
        FOREIGN KEY (diverifikasi_oleh) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_pengembalian_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS log_aktivitas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    aktivitas VARCHAR(150) NOT NULL,
    tabel_terkait VARCHAR(64),
    record_id BIGINT UNSIGNED,
    detail TEXT,
    waktu_aktivitas TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_aktivitas_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_log_user (user_id),
    INDEX idx_log_waktu (waktu_aktivitas),
    INDEX idx_log_tabel_record (tabel_terkait, record_id)
) ENGINE=InnoDB;

-- Stok tersedia dihitung dari alat yang sedang disetujui atau dipinjam.
CREATE OR REPLACE VIEW v_stok_alat AS
SELECT
    a.id AS alat_id,
    a.kode_alat,
    a.nama,
    a.kategori_id,
    a.stok_total,
    COALESCE(SUM(
        CASE
            WHEN p.status IN (
                'disetujui',
                'dipinjam',
                'menunggu_verifikasi_pengembalian'
            ) THEN dp.jumlah
            ELSE 0
        END
    ), 0) AS stok_dipinjam,
    a.stok_total - COALESCE(SUM(
        CASE
            WHEN p.status IN (
                'disetujui',
                'dipinjam',
                'menunggu_verifikasi_pengembalian'
            ) THEN dp.jumlah
            ELSE 0
        END
    ), 0) AS stok_tersedia,
    a.kondisi,
    a.status
FROM alat AS a
LEFT JOIN detail_peminjaman AS dp ON dp.alat_id = a.id
LEFT JOIN peminjaman AS p ON p.id = dp.peminjaman_id
GROUP BY
    a.id,
    a.kode_alat,
    a.nama,
    a.kategori_id,
    a.stok_total,
    a.kondisi,
    a.status;
