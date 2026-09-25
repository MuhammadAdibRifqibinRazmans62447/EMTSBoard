const express = require('express');
const router = express.Router();
const controller = require('../controller/general.js');
const pool = require('../database');
const authCheck = require('../middleware/authCheck.js')


router.get('/',controller.hub);
router.get('/login-board',controller.login);
router.post('/login-board',controller.login_post);
router.get('/logout', async (req, res) => {

    const user = req.session.user;

    req.session.destroy(async (err) => {

        if (err) {
            console.log(err);
            return res.status(500).send("Logout failed");
        }

        try {

            if (user) {
                await pool.query(
                    `INSERT INTO activity_logs
                    (employee_id, employee_name, role, action, target_type, target_id, description, status, ip_address)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        user.id,
                        user.name,
                        user.role,
                        'LOGOUT_SUCCESS',
                        'USER',
                        user.rc,
                        'User logged out successfully',
                        'SUCCESS',
                        req.ip
                    ]
                );
            }

        } catch (logError) {
            console.log("Activity log error:", logError);
        }

        res.clearCookie('connect.sid');

        res.redirect('/E-mts/login-board');
    });

});









module.exports = router;