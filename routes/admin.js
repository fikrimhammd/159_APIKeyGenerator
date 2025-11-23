const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Kita TIDAK lagi mendefinisikan hashPassword di sini,
// karena akan dipindahkan ke dalam module.exports.

module.exports = (db) => {
    
    // =========================================================
    // HELPER FUNCTION: Hashing Password (DIPINDAHKAN KE SINI)
    // Sekarang, fungsi ini bisa diakses oleh semua router.post/get di bawah.
    const hashPassword = (password) => {
        // Menggunakan SHA-256 untuk hashing satu arah
        return crypto.createHash('sha256').update(password).digest('hex');
    };
    // =========================================================

    // Middleware untuk memeriksa apakah admin sudah login (dipakai untuk endpoint Delete)
    const checkAuth = (req, res, next) => {
        if (req.session.isAdmin) {
            next();
        } else {
            res.status(403).json({ message: 'Akses ditolak. Silakan login.' });
        }
    };

    // =========================================================
    // 1. ENDPOINT REGISTRASI ADMIN (/register/admin)
    // =========================================================
    router.post('/register/admin', (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan Password wajib diisi!' });
        }
        
        const passwordHash = hashPassword(password); // SAFE: hashPassword sudah terdefinisi di sini
        const sql = 'INSERT INTO admin (email, password_hash, last_login) VALUES (?, ?, NOW())';

        db.query(sql, [email, passwordHash], (err, result) => {
            if (err) {
                console.error('Error Admin Register:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email admin sudah terdaftar!' });
                }
                return res.status(500).json({ error: 'Gagal mendaftarkan admin.' });
            }
            res.status(200).json({ message: 'Admin berhasil didaftarkan!', adminId: result.insertId });
        });
    });

    // =========================================================
    // 2. ENDPOINT LOGIN ADMIN (/login/admin)
    // =========================================================
    router.post('/login/admin', (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password wajib diisi.' });
        }

        db.query('SELECT id, password_hash FROM admin WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Login Query Error:', err);
                return res.status(500).json({ message: 'Error server database.' });
            }
            
            if (results.length > 0) {
                // Hashing password input dari user untuk dibandingkan dengan hash di database
                const inputHash = hashPassword(password); // SAFE: hashPassword sudah terdefinisi di sini
                
                if (inputHash === results[0].password_hash) {
                    
                    // 1. Login Berhasil! Set Session
                    req.session.isAdmin = true;
                    req.session.adminId = results[0].id;
                    
                    // 2. Update last_login
                    db.query('UPDATE admin SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [results[0].id], (err) => {
                        if (err) {
                            console.error('Gagal update last_login:', err);
                        }
                    });

                    // 3. Kirim respon sukses
                    res.status(200).json({ message: 'Login berhasil!', redirect: '/dashboard', adminId: results[0].id });
                    
                } else {
                    res.status(401).json({ message: 'Email atau password salah.' });
                }
            } else {
                res.status(401).json({ message: 'Email tidak terdaftar.' });
            }
        });
    });

    return router;
};