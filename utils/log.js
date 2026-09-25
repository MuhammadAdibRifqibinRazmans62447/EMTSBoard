const pool = require('../database');

async function logActivity(
    req,
    action,
    target_type,
    target_id,
    description,
    status = 'SUCCESS'
) {

    const user = req.session.user;

    await pool.query(
        `INSERT INTO activity_logs
        (
            employee_id,
            employee_name,
            role,
            action,
            target_type,
            target_id,
            description,
            status,
            ip_address
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            user?.id || null,
            user?.name || null,
            user?.role || null,
            action,
            target_type,
            target_id,
            description,
            status,
            req.ip
        ]
    );
}

module.exports = logActivity;