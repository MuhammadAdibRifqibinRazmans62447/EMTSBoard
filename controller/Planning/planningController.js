const bodyParser = require('body-parser');
const pool = require('../../database');
const sendEmail = require('../../service/emailsetup')
const approvalEmail = require('../../email/emailRequestor')
const logActivity= require('../../utils/log')


const homepage = async (req,res)=>{

        const {
        id: sesid,
        role: sesrole,
        name: name,
        dept: sesdept,
        ext:ext,
    } = req.session.user;

    let totalActive = 0;
    let totalComplete = 0;

    try{

         const [requests] = await pool.query(
            `SELECT COUNT(*) AS total_active
             FROM stage_track
             WHERE stage NOT IN ('R1', 'R2','I1') AND is_plan=0`
        );

        const [done] = await pool.query(
            `SELECT COUNT(*) AS total_comp
             FROM stage_track
             WHERE stage IN  ('R1','W1') AND is_plan=0`
        );

        totalActive = requests[0].total_active;
        totalComplete = done[0].total_comp;

    }catch(error){
         console.error("Homepage error:", error);
    }

res.render('../views/Planning/pdashboard',{
        user: req.session.user,
        totalActive,
        totalComplete
    });


}

const requestlist = async (req,res)=>{

const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

let I1 = 0;
let W1 = 0;
let PL1 = 0;
let PL2 = 0;
let total = 0;

let Requests = [];
let Remarks = [];
let Details = [];

try{

 [Requests] = await pool.query(
`
SELECT 
    r.req_id,
    r.req_name,
    r.req_ext,
    r.req_dep,
    r.MNumber,
    r.issuedate,
    r.returnjoc,
    r.issuejoc,
    r.spoilagejoc,
    r.receiveDate,
    r.approve_dep,
    s.stage
FROM requests r
INNER JOIN stage_track s 
ON s.MNumber = r.MNumber
WHERE s.stage <> 'R1'
AND s.stage <> 'R2'
AND s.stage <> 'I1'
ORDER BY r.req_datetime DESC
`
);

for (const e of Requests) {

    const [remarks] = await pool.query(
        `SELECT remark 
         FROM requests_detail 
         WHERE MNumber = ? AND status ='approve'
         LIMIT 1`,
        [e.MNumber]
    );

    e.remark = remarks.length > 0 ? remarks[0].remark : null;
}

Requests.forEach(e => {

switch(e.stage){
    case 'I1':
        I1++;
        break;
    case 'I2':
        I1++;
        break;
    case 'PL1':
        PL1++;
        break;
    case 'PL2':
        PL2++;
        break;
    case 'PL3':
        I1++;
        break;
     case 'W1':
        W1++;
        break;
}

total++;
    
});


             await pool.query(
                    `UPDATE stage_track
                    SET is_plan = 1
                    WHERE is_plan = 0
                    AND stage NOT IN ('R1', 'R2','I1')`,
                );


}catch{

console.log(error);

}

res.render('../views/Planning/planning_requestview.ejs',{Requests,I1,PL1,PL2,total,W1,
        user: req.session.user,  success: req.flash('success'),error: req.flash('error')});



}


const fetchItem = async(req,res)=>{

    const mnumber = req.params.Mnumber;

    try{

                   const [results] = await pool.query(
                    `SELECT *
                    FROM requests_detail
                    WHERE MNumber = ?
                    AND status <> ?`,
                    [mnumber, 'old']
                );
          res.json(results);

    }catch(e){

                console.error(error);
                res.status(500).json({
                    error: "Database error"
                });
    }

  



}



const fetchStage = async(req,res)=>{

    const mnumber = req.params.Mnumber;

    try{

         const [requestor] = await pool.query('SELECT req_name, req_id, issuedate FROM requests WHERE MNumber = ?', [mnumber]);
          const [currentStage] = await pool.query('Select * from stage_track where  MNumber=? ',[mnumber])
          const [pastapproval] = await pool.query('Select * from approval_history where  MNumber=? and action="Approved" ',[mnumber])

         res.json({
            requestor: requestor[0] || null,
            currentStage: currentStage[0] || null,
            pastapproval
        });

    }catch(e){

                console.error(error);
                res.status(500).json({
                    error: "Database error"
                });
    }

  



}


const approvedate = async (req, res) => {

    const {
        Mnumber,
        receiveDate,
        approve,
        recommendedDate,
        reason
    } = req.body;

    const {
        id: sesid,
        role: sesrole,
        name: name,
        dept: sesdept,
        ext:ext,
    } = req.session.user;

    const connection = await pool.getConnection();



    try {

        await connection.beginTransaction();

        // Get stage_track ID
        const [stageid] = await connection.query(
            `SELECT id 
             FROM stage_track 
             WHERE MNumber = ?`,
            [Mnumber]
        );

        if (stageid.length === 0) {
            throw new Error(`No stage_track found for MNumber: ${Mnumber}`);
        }

        if (approve === 'yes') {

            // Update stage
            await connection.query(
                `UPDATE stage_track
                 SET stage = 'PL2',
                     is_read = 0,
                     email_sent = 0,
                     is_plan=0
                 WHERE MNumber = ?`,
                [Mnumber]
            );

            // Record approval
            await connection.query(
                `INSERT INTO approval_history
                (
                    stage_id,
                    MNumber,
                    employee_id,
                    approval_name,
                    dep,
                    approve_datetime,
                    ext,
                    action,
                    stage,
                    remark
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    stageid[0].id,
                    Mnumber,
                    sesid,
                    name,
                    sesdept,
                    new Date(),
                    ext,
                    "Approved",
                    "PL1",
                    ""
                ]
            );

            await connection.query('Update requests set receiveDate=? where MNumber=?',[receiveDate,Mnumber])

            req.flash('success', 'Approved');
            res.redirect('/E-mts/planning/request-list');

        } else {


            
       
    const recommended_date = recommendedDate || null;
            // Update stage
            await connection.query(
                `UPDATE stage_track
                 SET stage = 'PL3',
                     is_read = 0,
                     email_sent = 0,
                     is_plan=0
                 WHERE MNumber = ?`,
                [Mnumber]
            );

            // Record rejection
            await connection.query(
                `INSERT INTO approval_history
                (
                    stage_id,
                    MNumber,
                    employee_id,
                    approval_name,
                    dep,
                    approve_datetime,
                    ext,
                    action,
                    stage,
                    remark,
                    recommended_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
                [
                    stageid[0].id,
                    Mnumber,
                    sesid,
                    name,
                    sesdept,
                    new Date(),
                    ext,
                    "Rejected",
                    "PL1",
                    reason,
                    recommended_date
                ]
            );

             const tos = [];

                const [jocdet] = await connection.query(
                    `SELECT approve_dep
                    FROM requests
                    WHERE MNumber = ?`,
                    [Mnumber]
                );

                if (jocdet.length > 0) {

                    const [listemail] = await connection.query(
                        `SELECT l.email
                        FROM user_list AS l
                        INNER JOIN user_roles AS r
                            ON l.employee_id = r.employee_id
                        WHERE l.active = 1
                        AND r.role_scope = 'Approval'
                        AND l.dept = ?`,
                        [jocdet[0].approve_dep]
                    );

                    listemail.forEach(e => {
                        if (e.email && e.email.trim() !== '') {
                            tos.push(e.email);
                        }
                    });

                    if (tos.length > 0) {
                        await sendEmail.sendEmail({
                            to: tos,
                            subject: 'EMTS DATE REJECTED',
                            html: approvalEmail.rejected({
                                Mnumber: Mnumber,
                                DEP: jocdet[0].approve_dep,
                                reasons:reason
                            })
                        });
                    }
                }

            req.flash('success', 'Rejected');
            res.redirect('/E-mts/planning/request-list');
        }

        // Everything successful
        await connection.commit();

    } catch (error) {

        // Undo transaction if anything failed
        await connection.rollback();

        console.error("approvedate error:", error);

        req.flash('error', 'Failed to process approval');
         res.redirect('/E-mts/planning/request-list');

    } finally {

        connection.release();
    }
};



const updateImaps = async (req, res) => {

    const { Mnumber } = req.body;

    const {
        id: sesid,
        name,
        dept: sesdept,
        ext
    } = req.session.user;

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Get stage_track ID
        const [stageid] = await connection.query(
            `SELECT id
             FROM stage_track
             WHERE MNumber = ?`,
            [Mnumber]
        );

        if (stageid.length === 0) {
            throw new Error(
                `No stage_track found for MNumber: ${Mnumber}`
            );
        }

        // Update stage
        await connection.query(
            `UPDATE stage_track
             SET stage = 'W1',
                 is_read = 0,
                 email_sent = 0,
                 is_plan=0
             WHERE MNumber = ?`,
            [Mnumber]
        );

        // Insert approval history
        await connection.query(
            `INSERT INTO approval_history
            (
                stage_id,
                MNumber,
                employee_id,
                approval_name,
                dep,
                approve_datetime,
                ext,
                action,
                stage,
                remark
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                stageid[0].id,
                Mnumber,
                sesid,
                name,
                sesdept,
                new Date(),
                ext,
                "Approved",
                "PL2",
                ""
            ]
        );


        //SV kut board is been


    const [jocdet] = await connection.query(
            `SELECT approve_dep,req_dep,req_id
             FROM requests
             WHERE MNumber = ? limit 1`,
            [Mnumber]
        );

        if (jocdet.length > 0) {

                const [listemail1] = await connection.query(
                    `SELECT DISTINCT l.email
                    FROM user_list AS l
                    INNER JOIN user_roles AS r
                        ON l.employee_id = r.employee_id
                    WHERE l.active = 1
                    AND r.role_scope = 'Approval'
                    AND l.dept IN (?, 'Production')`,
                    [jocdet[0].approve_dep]
                );

            const [listemail2] = await connection.query(
                        `SELECT l.email
                        FROM user_list AS l
                        INNER JOIN user_roles AS r
                            ON l.employee_id = r.employee_id
   
                        WHERE l.active = 1
                        AND l.employee_id = ?`,
                        [jocdet[0].req_id]
            );

                const tos = [];

                [...listemail1, ...listemail2].forEach(e => {
                    if (e.email && e.email.trim() !== "") {
                        tos.push(e.email.trim());
                    }
                });

            if (tos.length > 0) {

                await sendEmail.sendEmail({
                    to: tos,
                    subject: "E-MTS REQUEST APPROVE",
                    html: approvalEmail.ImapsUpdated({
                        Mnumber: Mnumber,
                        DEP: jocdet[0].approve_dep,
                    })
                });

            }
        }




        await connection.commit();

        res.json({
            success: true
        });

    } catch (error) {

        await connection.rollback();

        console.error('updateImaps error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to update request'
        });

    } finally {

        connection.release();

    }
};


const fetchUser = async (req,res)=>{

   const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

       try{

        const [lists] = await pool.query(`
        SELECT l.id,l.employee_id,l.password, l.name, l.active,l.dept,r.role_name,l.email
        FROM user_list l
        INNER JOIN user_roles r 
        ON l.employee_id = r.employee_id where l.dept=? AND l.active <> 2`,[sesdept]);

        const [roles] = await pool.query(`Select dep_name From  department`);

            res.render('../views/Planning/userManage.ejs', {
            lists,
            roles,
            user: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });
    }catch(err){

            console.log(err);
            res.status(500).send("Error processing approval");



    }






}





const addUser = async(req,res)=>{
      const conn = await pool.getConnection();
      let catchid=""

try {
   Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
    }
});

const { id, name, password, position, Department,email } = req.body;

  

    await conn.beginTransaction();

const [exists] = await conn.query(
                `
                SELECT employee_id, active
                FROM user_list
                WHERE employee_id = ?
                `,
                [id]
            );

            if (exists.length > 0) {

                // User exists and is active
                if (exists[0].active === 2) {

                    // Update user information
                    await conn.query(
                        `
                        UPDATE user_list
                        SET name = ?,
                            password = ?,
                            dept = ?,
                            email = ?,
                            active = 1
                        WHERE employee_id = ?
                        `,
                        [name, password, Department, email, id]
                    );

                    // Update user role
                    await conn.query(
                        `
                        UPDATE user_roles
                        SET role_name = ?,
                            role_scope = ?
                        WHERE employee_id = ?
                        `,
                        [position, 'Planning', id]
                    );

                    await conn.commit();
                      await logActivity(req,'ADD_USER','OLD_USER',id,'Admin Readding Old User','SUCCESS')

                    req.flash('success', 'User added successfully');
                    return res.redirect('/E-mts/planning/Go-to-edit');
                }

                // User exists but active = 2
                 await logActivity(req,'ADD_USER','OLD_USER',id,'Admin Readding Old User','FAILED')
                await conn.rollback();

                req.flash('error', 'User existed');
                return res.redirect('/E-mts/planning/Go-to-edit');
            }



    await conn.query(
        "INSERT INTO user_list (employee_id,name,password,dept,email) VALUES (?,?,?,?,?)",
        [id, name, password, Department,email]
    );

    await conn.query(
        "INSERT INTO user_roles (employee_id,role_name,role_scope) VALUES (?,?,?)",
        [id, position,'Planning']
    );

    await conn.commit();

     await logActivity(req,'ADD_USER','NEW_USER',id,'Admin Adding New User','SUCCESS')

    req.flash('success', 'Request Submitted for Planning');   

    res.redirect('/E-mts/planning/Go-to-edit');

} catch (err) {
    console.log(err);

    if (conn) {
         await logActivity(req,'ADD_USER','NEW_USER',catchid,'Admin Adding New User','FAILED')
        await conn.rollback();
        
    }
            req.flash('error', 'Failed to add user');

        res.redirect('/E-mts/planning/Go-to-edit');
}     finally {

        // release connection back to pool
        if (conn) {

            conn.release();

        }

    }



}


const editUser = async(req,res)=>{

const conn = await pool.getConnection();
let gid =""; 
try{

const { id, name, password, position, Department,email } = req.body;
gid = id;
await conn.beginTransaction();

        await conn.query(
            `
            UPDATE user_list 
            SET name=?, password=?, dept=?,email=?
            WHERE employee_id=?
            `,
            [name, password, Department,email, id]
        );


        // Update user role
        await conn.query(
            `
            UPDATE user_roles
            SET role_name=?
            WHERE employee_id=?
            `,
            [position, id]
        );

         await conn.commit();
           await logActivity(req,'EDIT_USER','USER',id,'Admin Edit User','SUCCESS')
         req.flash('success','User updated successfully');

        res.redirect('/E-mts/planning/Go-to-edit');


}catch(err){

        console.log(err);

        if(conn){
            await logActivity(req,'EDIT_USER','USER',gid,'Admin Edit User','FAILED')
            await conn.rollback();
        }

        req.flash('error','Failed to update user');

        res.redirect('/E-mts/planning/Go-to-edit');


}finally{

         if(conn){
            conn.release();
        }


}






}


const switchUser = async(req,res)=>{
        let catcheing = "";
    let cathid="";

    try {

        const id = req.params.id;
        const active = Number(req.params.active);

        const newStatus = active === 1 ? 0 : 1;


        const [results] = await pool.query(
            "UPDATE user_list SET active=? WHERE employee_id=?",
            [newStatus, id]
        );


               const desc = newStatus ? 'Activate' : 'Deactivate';
       catcheing = desc;
       cathid = id;
        await logActivity(req,'SWITCH_USER','USER',id,`Admin ${desc} User`,'SUCCESS')
        // res.json(results);
         res.sendStatus(200);


    } catch (error) {

        console.error(error);

         await logActivity(req,'SWITCH_USER','USER',cathid,`Admin ${catcheing} User`,'FAILED')
        res.status(500).json({
            error: "Database error"
        });

    }

}



const deleteUser = async(req,res)=>{

const conn = await pool.getConnection();
const id = req.params.id;

try {

        



        const [results] = await pool.query(
            "UPDATE user_list SET active=? WHERE employee_id=?",
            [2, id]
        );


        await logActivity(req,'DELETE_USER','USER',id,'Admin Delete User','SUCCESS')
        // res.json(results);
         res.sendStatus(200);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Database error"
        });

    }




}

const fetchHistory = async (req, res) => {

    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;
        let date = new Date();

        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();

        date = `${yyyy}-${mm}`;


    try {

        let sql = `
            SELECT 
                r.req_id,
                r.req_name,
                r.req_ext,
                r.req_dep,
                r.MNumber,
                r.issuedate,
                r.returnjoc,
                r.issuejoc,
                r.spoilagejoc,
                r.receiveDate,
                r.approve_dep,
                s.stage
            FROM requests r
            INNER JOIN stage_track s 
                ON s.MNumber = r.MNumber
            WHERE s.stage IN ('R1', 'W1','R2')
            ORDER BY r.req_datetime DESC
        `;

        const [Requests] = await pool.query(sql);
                     await pool.query(
                    `UPDATE stage_track
                    SET is_plan = 1
                    WHERE is_plan = 0
                    AND stage  IN ('R1', 'W1')`,
                );

        for (const e of Requests) {

    const [remarks] = await pool.query(
        `SELECT remark 
         FROM requests_detail 
         WHERE MNumber = ? 
         LIMIT 1`,
        [e.MNumber]
    );

    e.remark = remarks.length > 0 ? remarks[0].remark : null;
}

        res.render('../views/Planning/history.ejs', { Requests, user: req.session.user,date});

    } catch (err) {
        console.log(err);
        res.status(500).send("Error processing approval");
    }
};




const fetchFilter = async (req,res)=>{

             const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

            const stat = req.params.stat;
            const month_select = req.params.month_select;

            const [year, month] = month_select.split("-");

            const proddate1 = `${year}-${month}-01`;

            const nextMonth = Number(month) === 12
                ? `${Number(year) + 1}-01-01`
                : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;

            const proddate2 = nextMonth;

            console.log(proddate1);
            console.log(proddate2);

            let sql = `
                    SELECT 
                        r.req_id,
                        r.req_name,
                        r.req_ext,
                        r.req_dep,
                        r.MNumber,
                        r.issuedate,
                        r.returnjoc,
                        r.issuejoc,
                        r.spoilagejoc,
                        r.receiveDate,
                        r.approve_dep,
                        s.stage
                    FROM requests r
                    INNER JOIN stage_track s 
                        ON s.MNumber = r.MNumber
                    `;

                    let conditions = [];
                    let params = [];



                    // Month condition
                    conditions.push(`r.issuedate >= ?`);
                    conditions.push(`r.issuedate < ?`);

                    params.push(proddate1, proddate2);

                    // Status condition
                    if (stat !== "All") {
                        conditions.push(`r.M_status = ?`);
                        params.push(stat);
                       

                    }
                    conditions.push(`s.stage IN ('R1', 'W1','R2')`);

                    // Add WHERE
                    sql += ` WHERE ${conditions.join(" AND ")}`;

                    sql += ` ORDER BY r.req_datetime DESC`;

                    console.log(sql);
                    console.log(params);

                        try {

                            const [rows] = await pool.query(sql, params);
                            console.log(rows);

                            res.json(rows);

                        } catch (error) {

                            console.error(error);

                            res.status(500).json({
                                error: "Database error"
                            });

                        }
                
        
    }



const cancleRequest = async (req, res) => {

    const { Mnumber, reason } = req.body;

    const {
        id: sesid,
        name,
        dept: sesdept,
        ext
    } = req.session.user;

    // Validate input
    if (!Mnumber) {
        return res.status(400).json({
            success: false,
            message: "M Number is required."
        });
    }

    if (!reason || reason.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Reason is required."
        });
    }

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        // Get stage_track ID
        const [stageid] = await connection.query(
            `SELECT id
             FROM stage_track
             WHERE MNumber = ?`,
            [Mnumber]
        );

        if (stageid.length === 0) {
            throw new Error(
                `No stage_track found for MNumber: ${Mnumber}`
            );
        }

        // Reject request details
        await connection.query(
            `UPDATE requests_detail
             SET status = ?
             WHERE MNumber = ?`,
            [
                "cancle",
                Mnumber
            ]
        );



        // Update stage
        await connection.query(
            `UPDATE stage_track
             SET stage = ?,
                 is_read = 0,
                 email_sent = 0,
                 is_plan = 0
             WHERE MNumber = ?`,
            [
                "I2",
                Mnumber
            ]
        );

        // update all cancled items
        await connection.query(
            `UPDATE approval_history
             SET action =? where MNumber =?`,
            [
                "Cancelled",
                Mnumber

            ]
        );

        // Get approving department
        const [jocdet] = await connection.query(
            `SELECT approve_dep,req_id
             FROM requests
             WHERE MNumber = ? limit 1`,
            [Mnumber]
        );

        if (jocdet.length > 0) {

            const [listemail] = await connection.query(
                `SELECT l.email
                FROM user_list AS l
                INNER JOIN user_roles AS r
                    ON l.employee_id = r.employee_id
                WHERE l.active = 1
                AND r.role_scope = 'Approval'
                AND (
                    l.dept = ?
                    OR l.employee_id = ?
                )`,
                [jocdet[0].approve_dep, jocdet[0].req_id]
            );

            const tos = [];

            listemail.forEach(e => {

                if (e.email && e.email.trim() !== "") {
                    tos.push(e.email);
                }

            });

            if (tos.length > 0) {

                await sendEmail.sendEmail({
                    to: tos,
                    subject: "E-MTS content error",
                    html: approvalEmail.rejectedPlanning({
                        Mnumber: Mnumber,
                        DEP: jocdet[0].approve_dep,
                        reason: reason
                    })
                });

            }
        }

        await connection.commit();

        return res.json({
            success: true
        });

    } catch (error) {

        await connection.rollback();

        console.error("Cancel request error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        connection.release();

    }
};




const downloadData = async (req, res) => {

    try {

        const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

        const stat = req.params.stat;
        const month_select = req.params.month_select;

        const [year, month] = month_select.split("-");

        const proddate1 = `${year}-${month}-01`;

        const nextMonth = Number(month) === 12
            ? `${Number(year) + 1}-01-01`
            : `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;

        const proddate2 = nextMonth;

        const finaldata = [];


        // =========================
        // SQL 1
        // =========================

        let sql1 = `
            SELECT 
                r.MNumber,
                r.req_id,
                r.req_name,
                r.req_ext,
                r.req_dep,
                r.issuedate,
                r.receiveDate,
                r.spoilagejoc,
                r.returnjoc,
                r.issuejoc,
                r.approve_dep
            FROM requests r
            INNER JOIN stage_track s
                ON r.MNumber = s.MNumber
        `;

        const conditions = [];
        const params = [];


        // Month condition
        conditions.push(`r.issuedate >= ?`);
        conditions.push(`r.issuedate < ?`);

        params.push(proddate1, proddate2);


        // Status condition
        if (stat !== "All") {

            conditions.push(`r.M_status = ?`);
            params.push(stat);

        }


        // Stage condition
        conditions.push(`s.stage IN ('R1', 'W1', 'R2')`);


        // WHERE
        sql1 += ` WHERE ${conditions.join(" AND ")}`;


        // ORDER
        sql1 += ` ORDER BY r.req_datetime DESC`;


        const [result1] = await pool.query(
            sql1,
            params
        );

        console.log(sql1);
        console.log(params)
       


        // =========================
        // SQL 2
        // =========================

        const sql2 = `
            SELECT 
                r.itemno,
                r.itemdesc,
                r.itemcat,
                r.reqqty,
                r.remark
            FROM requests_detail r
            INNER JOIN stage_track s
                ON r.MNumber = s.MNumber
            WHERE r.status IN ('approve', 'reject')
            AND s.stage IN ('W1', 'R1', 'R2')
            AND r.MNumber = ?
        `;

        const sql3 = `
            SELECT 
            stage
            FROM stage_track
            WHERE MNumber =?
        `;


        // =========================
        // Get Details
        // =========================

        for (const request of result1) {

                const [result2] = await pool.query(
                    sql2,
                    [request.MNumber]
                );

                const [result3] = await pool.query(
                    sql3,
                    [request.MNumber]
                );

                if (result2.length > 0 || result3.length > 0) {

                    finaldata.push({
                        ...request,
                        details: result2,
                        extraDetails: result3.length > 0 ? result3[0].stage : null
                    });
                }

        }


        // =========================
        // Response
        // =========================

        res.json(finaldata);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Database error"
        });

    }
};

const downloadCurrent = async(req,res)=>{

    const Mnumbers = req.params.Mnumber.split(',');
    const MdetailTemp = [];
    const finaldata = [];

    try{

    const sql1 = `
        SELECT 
            MNumber,
            req_id,
            req_name,
            req_ext,
            req_dep,
            issuedate,
            receiveDate,
            spoilagejoc,
            returnjoc,
            issuejoc,
            approve_dep
        FROM requests
        WHERE M_status = "Pending"
        AND MNumber = ?
    `;

    for (const e of Mnumbers) {

        const [row] = await pool.query(sql1, [e]);

        if (row.length > 0) {
            MdetailTemp.push(row[0]);
        }
    }

        const sql2 = `
            SELECT 
                itemno,
                itemdesc,
                itemcat,
                reqqty,
                remark
            FROM requests_detail
            WHERE status = 'approve'
            AND MNumber = ?
        `;

        const sql3 = `
            SELECT 
            stage
            FROM stage_track
            WHERE MNumber =?
        `;

            for (const request of MdetailTemp) {

                const [result2] = await pool.query(
                    sql2,
                    [request.MNumber]
                );

                const [result3] = await pool.query(
                    sql3,
                    [request.MNumber]
                );

                if (result2.length > 0 || result3.length > 0) {

                    finaldata.push({
                        ...request,
                        details: result2,
                        extraDetails: result3.length > 0 ? result3[0].stage : null
                    });
                }
            }

        res.json(finaldata);




    }catch(error){

        console.error(error);

        res.status(500).json({
            error: "Database error"
        });



    }





}



const editProfile = async (req, res) => {

    const { id: sesid } = req.session.user;

    try {

        const [info] = await pool.query(
            `SELECT *
             FROM user_list
             WHERE employee_id = ?`,
            [sesid]
        );

        if (info.length === 0) {
            return res.status(404).send("User not found");
        }

        res.render('../views/Planning/editprofile.ejs', {
            info: info[0],
            user: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Error loading profile");

    }
};

const changeUser = async (req, res) => {

    const { id: sesid } = req.session.user;

    const {
        employee_id,
        name,
        email,
        password,
    } = req.body;

    try {

        await pool.query(
            `UPDATE user_list
             SET name = ?,
                 password = ?,
                 email = ?
             WHERE employee_id = ?`,
            [name, password, email, employee_id]
        );

        req.flash('success', 'User updated successfully');

        res.redirect('/E-mts/planning/editProfile');

    } catch (error) {

        console.error(error);

        req.flash('error', 'Failed to update user');

        res.redirect('/E-mts/planning/editProfile');
    }
};


module.exports={
    homepage,
    requestlist,
    fetchItem,
    approvedate,
    fetchStage,
    updateImaps,
    fetchUser,
    fetchHistory,
    fetchFilter,
    addUser,
    editUser,
    deleteUser,
    switchUser,
    downloadData,
    downloadCurrent,
    cancleRequest,
    editProfile,
    changeUser
}