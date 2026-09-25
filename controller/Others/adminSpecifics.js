const bodyParser = require('body-parser');
const pool = require('../../database');
const sendEmail = require('../../service/emailsetup')
const approvalEmail = require('../../email/emailRequestor')

const logActivity= require('../../utils/log')


const AdminRequest = async (req,res)=>{

   Object.keys(req.session.user).forEach(key => {
    if (typeof req.session.user[key] === "string") {
        req.session.user[key] = req.session.user[key].trim();
    }
});

const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

let I1 = 0;
let PL1 = 0;
let PL2 = 0;
let W1 = 0;
let PL3 = 0;
let total = 0;

let Requests = [];
let Details = [];



try{

if(sesdept === 'Production'){


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
  AND r.M_status = 'Pending'
ORDER BY r.req_datetime DESC;
`
);


} else{

    // console.log('fethcibng others  '+ sesdept)
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
WHERE (r.req_dep = ? OR r.approve_dep = ?)
AND s.stage <> 'R1'
AND s.stage <> 'R2'
AND r.M_status = 'Pending'
ORDER BY r.req_datetime DESC;
`,
[sesdept,sesdept]
);
console.log(sesdept)
console.log(Requests)
console.log("Here")
}   








Requests.forEach(e => {

switch(e.stage){
    case 'I1':
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
    case 'I2':
        I1++;
        break;
     case 'W1':
        W1++;
        break;
}

total++;
    
});

      // update notification badge

     await pool.query(
                    `UPDATE stage_track
                    SET email_sent = 1
                    WHERE email_sent = 0
                    AND stage NOT IN ('R1', 'R2')`
                );




}catch(error){

    console.log(error);

}

res.render('../views/Others/Adminlist.ejs',{Requests,I1,PL1,PL2,total,PL3,W1,
        user: req.session.user
    });



}

const approvalform = async (req, res) => {

    const Mnumber = req.params.Mnumber;
    let Requests = [];
    let reqdetail = null;

    try {

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
        r.req_datetime,
        r.issuejoc,
        r.spoilagejoc,
        r.receiveDate,
        r.approve_dep,
        d.itemno,
        d.itemdesc,
        d.itemcat,
        d.reqqty,
        d.remark
    FROM requests r
    INNER JOIN requests_detail d 
        ON d.MNumber = r.MNumber
    WHERE r.MNumber = ?
    AND d.status <> ?
    `,
    [
        Mnumber,
        'old'
    ]
);

        if (Requests.length === 0) {
            return res.status(404).send("Request not found");
        }

        reqdetail = Requests[0];

        return res.render("../views/Others/e-mts-approval", {
            user: req.session.user,
            Mnumber,
            reqdetail,
            Requests
        });

    } catch(error) {
        console.error("Approval form error:", error);
        return res.status(500).send("Internal Server Error");
    }
};



const submitApproval = async(req,res)=>{
    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;
    const connection = await pool.getConnection();

    try{
        await connection.beginTransaction();

     const { approval1Name, approval1ID,approval1Dep,approval1Ext,approval1DateTime,mtsno,receiveDate,dateoption,itemno,reqqty,remark,approval
     } = req.body;

    let rejected = false;
    let detector = 0;

approval.forEach((e) => {

    if (e === "approve") {
        detector++;
    }

});

if(detector === 0){
        rejected = true;

    }


    if(!rejected){

        // update each item status
            for(let x = 0; x < itemno.length; x++){

                await connection.query(
                    `UPDATE requests_detail
                    SET status = ?, reqqty = ?, remark = ?
                    WHERE MNumber = ? AND itemno = ? AND status <> ?`,
                    [
                        approval[x],
                        reqqty[x],
                        remark[x],
                        mtsno,
                        itemno[x],
                        'old'
                    ]
                );
            }

            // update recivedate
            if(dateoption === "yes"){

                 await connection.query(
                    `UPDATE requests
                    SET receiveDate = ?
                    WHERE MNumber = ? `,
                    [
                        receiveDate,
                        mtsno,
                        
                    ]
                );

            }

            // update stage

             await connection.query(
                    `UPDATE stage_track
                    SET stage = "PL1", is_read=0, email_sent=0,is_plan=0
                    WHERE MNumber = ? `,
                    [
                        
                        mtsno,
                        
                    ]
                );

                // insert approval details
                const [stageid] = await pool.query(
                    "SELECT id FROM stage_track WHERE MNumber = ?",
                    [mtsno]
                );

                await connection.query(
                    `INSERT INTO approval_history
                    (stage_id, MNumber, employee_id,approval_name, dep, approve_datetime, ext, action, stage, remark)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    [
                        stageid[0].id,
                        mtsno,
                        approval1ID,
                        approval1Name,
                        approval1Dep,
                        approval1DateTime,
                        approval1Ext,
                        "Approved",
                        "I1",
                        ""
                    ]
                );

                const [requestor] = await connection.query(
                    'SELECT req_dep, req_name FROM requests WHERE MNumber=? LIMIT 1',
                    [mtsno]
                );

                const [remarks] = await connection.query(
                    'SELECT remark FROM requests_detail WHERE MNumber=? LIMIT 1',
                    [mtsno]
                );

                const[username] = await connection.query(
                    'SELECT name FROM user_list WHERE employee_id=? LIMIT 1',
                    [sesid]
                );

                    const [cancle] = await connection.query(
                        `SELECT 1
                        FROM approval_history
                        WHERE MNumber = ?
                        AND action = 'Cancelled'
                        LIMIT 1`,
                        [mtsno]
                    );

                const tos = [];

                const [listemail] = await connection.query(
                    `SELECT l.email
                    FROM user_list AS l
                    INNER JOIN user_roles AS r
                        ON l.employee_id = r.employee_id    
                    WHERE l.active = 1
                    AND l.dept = 'Planning'`
                );

                listemail.forEach(e => {
                    if (e.email && e.email.trim() !== '') {
                        tos.push(e.email);
                    }
                });

                const now = new Date();

                    const thisdate =
                        String(now.getDate()).padStart(2, '0') + '/' +
                        String(now.getMonth() + 1).padStart(2, '0') + '/' +
                        now.getFullYear() + ' ' +
                        String(now.getHours()).padStart(2, '0') + ':' +
                        String(now.getMinutes()).padStart(2, '0') + ':' +
                        String(now.getSeconds()).padStart(2, '0');

                if (cancle.length > 0) {

                                    await sendEmail.sendEmail({
                    to: tos,
                    subject: `Approval application (resubmission)EXTRA BOARD (MTS) ${mtsno} is pending`,
                    html: approvalEmail.planningCancle({
                        Mnumber: mtsno,
                        DEP: 'Planning',
                        Reqdep: requestor[0]?.req_dep || '',
                        Reqname: requestor[0]?.req_name || '',
                        Date: thisdate,
                        Remark: remarks[0]?.remark || '',
                        name:username[0]?.name||''
                    })
                });
   
    } else {


                    await sendEmail.sendEmail({
                    to: tos,
                    subject: `Approval application EXTRA BOARD (MTS) ${mtsno} is pending`,
                    html: approvalEmail.planning({
                        Mnumber: mtsno,
                        DEP: 'Planning',
                        Reqdep: requestor[0]?.req_dep || '',
                        Reqname: requestor[0]?.req_name || '',
                        Date: thisdate,
                        Remark: remarks[0]?.remark || '',
                        name:username[0]?.name||''
                    })
                });


    
}        






    }else{

          for(let x = 0; x < itemno.length; x++){

                await connection.query(
                    `UPDATE requests_detail
                    SET status = ?, reqqty = ?, remark = ?
                    WHERE MNumber = ? AND itemno = ? AND status <> ?`,
                    [
                        approval[x],
                        reqqty[x],
                        remark[x],
                        mtsno,
                        itemno[x],
                        'old'
                    ]
                );
            }

            // rejected
             await connection.query(
                    `UPDATE requests
                    SET M_status = ?
                    WHERE MNumber = ? `,
                    [
                        "Rejected",
                        mtsno,
                        
                    ]
                );

                await connection.query(
                    `UPDATE stage_track
                    SET stage = "R2", is_read=0, email_sent=0,is_plan=0
                    WHERE MNumber = ? `,
                    [
                        
                        mtsno,
                        
                    ]
                );

                                // insert approval details
                const [stageid] = await connection.query(
                    "SELECT id FROM stage_track WHERE MNumber = ?",
                    [mtsno]
                );
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
                            VALUES (?,?,?,?,?,?,?,?,?,?)`,
                            [
                                stageid[0].id,
                                mtsno,
                                approval1ID,
                                approval1Name,
                                approval1Dep,
                                approval1DateTime,
                                approval1Ext,
                                "Rejected",
                                "I1",
                                ""
                            ]
                        );



    }
    
   

    await connection.commit();
   

    }catch(err){

    console.log(err);
    res.status(500).send("Error processing approval");


    }
     finally {

        // release connection back to pool
        connection.release();

    }



 res.redirect('/E-mts/board/list-board-admin');

}






  


const GouserManagement = async (req, res) => {

    Object.keys(req.session.user).forEach(key => {
        if (typeof req.session.user[key] === "string") {
            req.session.user[key] = req.session.user[key].trim();
        }
    });

    const {
        id: sesid,
        role: sesrole,
        name: sesname,
        rc:sesrc,
        dept: sesdept
    } = req.session.user;

    try {

        let roleCondition;



        const [lists] = await pool.query(`
            SELECT 
                l.id,
                l.employee_id,
                l.password,
                l.name,
                l.active,
                l.dept,
                r.role_name,
                r.role_scope,
                l.email
            FROM user_list l
            INNER JOIN user_roles r
                ON l.employee_id = r.employee_id
            WHERE l.dept = ?
                AND l.active <> 2
        `, [sesdept]);

            const [roles] = await pool.query(`
                SELECT dep_name
                FROM department
                WHERE dep_name <> 'Planning'
                AND active = 1
            `);



        res.render('../views/Others/userManage.ejs', {
            lists,
            roles,
            user: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });

    } catch (err) {

        console.log(err);
        res.status(500).send("Error processing approval");

    }
};


const GotoDept = async (req, res) => {
    try {
        const [lists] = await pool.query(`
            SELECT *
            FROM department
            WHERE active <> 2 and dep_name <> 'Planning'
           
        `);

        res.render('../views/Others/deptlist.ejs', {
            lists,
            user: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing department");
    }
};



const addDept = async(req,res)=>{
      const conn = await pool.getConnection();

try {
   Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
    }
});

const { deptname,ext} = req.body;

  

    await conn.beginTransaction();

        const [exists] = await conn.query(
            `SELECT dep_name
            FROM department
            WHERE LOWER(dep_name) = LOWER(?)
            AND active <> 2`,
            [deptname]
        );

        if (exists.length > 0) {

            req.flash('error', 'departmenr already exists');

            return res.redirect('/E-mts/board/GotoDept');

        }


    await conn.query(
        "INSERT INTO department (dep_name,EXT) VALUES (?,?)",
        [deptname,ext]
    );



    await conn.commit();
      await logActivity(req,'ADD_DEPT','NEW_DEPT',deptname,'Admin Add New Dept','SUCCESS')

    req.flash('success', 'Department added');   

    res.redirect('/E-mts/board/GotoDept');

} catch (err) {
    console.log(err);

    if (conn) {
        await conn.rollback();
        
    }
            req.flash('error', 'Failed to add department');

        res.redirect('/E-mts/board/GotoDept');
}     finally {

        // release connection back to pool
        if (conn) {

            conn.release();

        }

    }



}



const addUser = async (req, res) => {
    const conn = await pool.getConnection();
        const {
        id: sesid,
        role: sesrole,
        name: sesname,
        rc:sesrc,
        dept: sesdept
    } = req.session.user;

    let catchid=""

    try {

        // Trim input
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === "string") {
                req.body[key] = req.body[key].trim();
            }
        });

        const {
            id,
            name,
            password,
            email,
            position,
            scope,
            Department
        } = req.body;

        catchid=id;
        await conn.beginTransaction();


        // Check if user already exists
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
                        [position, scope, id]
                    );

                    



                    await conn.commit();
                    await logActivity(req,'ADD_USER','OLD_USER',id,'Admin Readding Old User','SUCCESS')

                    req.flash('success', 'User added successfully');
                    return res.redirect('/E-mts/board/Go-to-edit');
                }

                 await logActivity(req,'ADD_USER','OLD_USER',id,'Admin Readding Old User','FAILED')

                // User exists but active = 2
                await conn.rollback();

                req.flash('error', 'User existed');
                return res.redirect('/E-mts/board/Go-to-edit');
            }


        // Insert new user
        await conn.query(
            `
            INSERT INTO user_list
                (employee_id, name, password, dept, email)
            VALUES (?, ?, ?, ?, ?)
            `,
            [id, name, password, Department, email]
        );


        // Insert user role
        await conn.query(
            `
            INSERT INTO user_roles
                (employee_id, role_name, role_scope)
            VALUES (?, ?, ?)
            `,
            [id, position, scope]
        );


        
        await conn.commit();
         await logActivity(req,'ADD_USER','NEW_USER',id,'Admin Adding New User','SUCCESS')

        req.flash('success', 'User added successfully');
        return res.redirect('/E-mts/board/Go-to-edit');


    } catch (err) {

        console.error(err);
         await logActivity(req,'ADD_USER','NEW_USER',catchid,'Admin Adding New User','FAILED')

        await conn.rollback();


        req.flash('error', 'Failed to add user');
        return res.redirect('/E-mts/board/Go-to-edit');


    } finally {

        conn.release();

    }
};






const editUser = async(req,res)=>{

const conn = await pool.getConnection();
let gid =""; 

try{

const { id, name, password, position,scope, Department,email } = req.body;
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
            SET role_name=?,role_scope=?
            WHERE employee_id=?
            `,
            [position,scope, id]
        );

         await conn.commit();
          await logActivity(req,'EDIT_USER','USER',id,'Admin Edit User','SUCCESS')
                 req.flash('success','User updated successfully');

        res.redirect('/E-mts/board/Go-to-edit');


}catch(err){

        console.log(err);

        if(conn){
            await conn.rollback();
        }

        await logActivity(req,'EDIT_USER','USER',gid,'Admin Edit User','FAILED')
        req.flash('error','Failed to update user');

        res.redirect('/E-mts/board/Go-to-edit');


}finally{

         if(conn){
            conn.release();
        }


}




}


const editdept = async(req,res)=>{

const conn = await pool.getConnection();

try{

const { id,ext,deptname } = req.body;

await conn.beginTransaction();

        await conn.query(
            `
            UPDATE department 
            SET EXT=?
            WHERE dep_id=?
            `,
            [ext, id]
        );



        await logActivity(req,'EDIT_DEPT','DEPT',deptname,'Admin Edit Department','SUCCESS')
         await conn.commit();
        req.flash('success','Department updated successfully');

        res.redirect('/E-mts/board/GotoDept');


}catch{

        console.log(err);

        if(conn){
            await conn.rollback();
        }

        req.flash('error','Failed to update Department');

        res.redirect('/E-mts/board/GotoDept');


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


const switchDept = async(req,res)=>{


    try {

        const id = req.params.id;
        const active = Number(req.params.active);

        const newStatus = active === 1 ? 0 : 1;


        const [results] = await pool.query(
            "UPDATE department SET active=? WHERE dep_id=?",
            [newStatus, id]
        );

        const[name] = await pool.query("SELECT dep_name FROM department where dep_id=? ",[id])

         const desc = newStatus ? 'Activate' : 'Deactivate';

         await logActivity(req,'SWITCH_DEPT','DEPT',name[0].dep_name,`Admin ${desc} DEPT`,'SUCCESS')
    
        // res.json(results);
         res.sendStatus(200);


    } catch (error) {

        console.error(error);

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




const GoJOC = async(req,res)=>{
    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

    try{

        const [lists] = await pool.query(`
        SELECT * from JOC where DEP=? and active <> 2`,[sesdept]);

        res.render('../views/Others/joclist.ejs', {
            lists,
            user: req.session.user,
            success: req.flash('success'),
            error: req.flash('error')
        });

        


    }catch(error){
            console.log(err);
            res.status(500).send("Error processing approval");


    }


}


const addJOC = async(req,res)=>{
      const conn = await pool.getConnection();
      let temp =""

try {

Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
    }
});

const { joc, remark, Department } = req.body;
temp =joc;
  

    await conn.beginTransaction();

        const [exists] = await conn.query(
            "SELECT JOC, active FROM JOC WHERE JOC=?",
            [joc]
        );

            if (exists.length > 0) {

                if (exists[0].active === 2) {

                    await conn.query(
                        `
                        UPDATE JOC 
                        SET
                            DEP = ?,
                            remark = ?,
                            active = ?
                        WHERE JOC = ?
                        `,
                        [Department, remark, 1, joc]
                    );

                    await conn.commit();

                    await logActivity(
                        req,
                        'ADD_JOC',
                        'OLD_JOC',
                        joc,
                        'Approval Add OLD JOC',
                        'SUCCESS'
                    );

                    req.flash('success', 'JOC ADDED');

                    return res.redirect('/E-mts/board/Go-to-joc');
                }

                req.flash('error', 'JOC already exists');

                await logActivity(
                    req,
                    'ADD_JOC',
                    'OLD_JOC',
                    joc,
                    'Approval Add OLD JOC',
                    'FAILED'
                );

                return res.redirect('/E-mts/board/Go-to-joc');
            }


    await conn.query(
        "INSERT INTO JOC (JOC,DEP,remark) VALUES (?,?,?)",
        [joc, Department, remark]
    );

 

    await conn.commit();
    await logActivity(req,'ADD_JOC','NEW_JOC',joc,'Approval Add New JOC','SUCCESS')
    req.flash('success', 'JOC ADDED');   

    res.redirect('/E-mts/board/Go-to-joc');

} catch (err) {
    console.log(err);

    if (conn) {
        await conn.rollback();
        await logActivity(req,'ADD_JOC','NEW_JOC',temp,'Approval Add New JOC','FAILED')
    }
            req.flash('error', 'Failed to add JOC');

        res.redirect('/E-mts/board/Go-to-joc');
}     finally {

        // release connection back to pool
        if (conn) {

            conn.release();

        }

    }



}



const editJOC = async(req,res)=>{

const conn = await pool.getConnection();

try{

const { edit_joc,edit_remark } = req.body;

await conn.beginTransaction();

        await conn.query(
            `
            UPDATE JOC 
            SET remark=?
            WHERE JOC=?
            `,
            [edit_remark,edit_joc]
        );


        // Update user role


         await conn.commit();
         await logActivity(req,'EDIT_JOC','JOC',edit_joc,'Approval Edit JOC','SUCCESS')
        req.flash('success','JOC updated successfully');


       res.redirect('/E-mts/board/Go-to-joc');


}catch{

        console.log(err);

        if(conn){
            await conn.rollback();
        }

        req.flash('error','Failed to update user');

       res.redirect('/E-mts/board/Go-to-joc');


}finally{

         if(conn){
            conn.release();
        }


}




}


const switchJOC = async(req,res)=>{

        let catcheing = "";
        let cathid="";
    try {

        const id = req.params.joc;
        const active = Number(req.params.active);

        const newStatus = active === 1 ? 0 : 1;


        const [results] = await pool.query(
            "UPDATE JOC SET active=? WHERE JOC=?",
            [newStatus, id]
        );

            const desc = newStatus ? 'Activate' : 'Deactivate';
       catcheing = desc;
       cathid = id;
        await logActivity(req,'SWITCH_JOC','JOC',id,`Admin ${desc} JOC`,'SUCCESS')
        // res.json(results);
         res.sendStatus(200);


    } catch (error) {

        console.error(error);

         await logActivity(req,'SWITCH_JOC','JOC',cathid,`Admin ${catcheing} JOC`,'SUCCESS')
        res.status(500).json({
            error: "Database error"
        });

    }

}


const deleteJOC = async(req,res)=>{

const conn = await pool.getConnection();
const joc = req.params.joc;

try {

        



        const [results] = await pool.query(
            "UPDATE JOC SET active=? WHERE JOC=?",
            [2, joc]
        );

        await logActivity(req,'DELETE_JOC','JOC',joc,'Admin Delete JOC','SUCCESS')
        // res.json(results);
         res.sendStatus(200);


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Database error"
        });

    }




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



const fetchfail = async (req, res) => {

    const mnumber = req.params.Mnumber;

    try {

        const [requestor] = await pool.query(
            `SELECT req_name, req_id, issuedate
             FROM requests
             WHERE MNumber = ? `,
            [mnumber]
        );

        const [pastapproval] = await pool.query(
            `SELECT *
            FROM approval_history
            WHERE MNumber = ?
            AND action = 'Rejected'
            ORDER BY approve_datetime DESC`,
            [mnumber]
        );

        res.json({
            requestor: requestor[0] || null,
            pastapproval
        });

    } catch (e) {

        console.error("fetchfail error:", e);

        res.status(500).json({
            error: "Database error"
        });
    }
};


const fetchDates = async (req, res) => {

    const mnumber = req.params.Mnumber;

    try {

                const [recommed] = await pool.query(
                    `SELECT 
                        remark,
                        DATE_FORMAT(recommended_date, '%Y-%m-%d') AS recommended_date
                    FROM approval_history
                    WHERE MNumber = ?
                    AND stage = 'PL1'
                    AND action = 'Rejected'`,
                    [mnumber]
                );

        res.json(recommed);

    } catch (e) {

        console.error(e);

        res.status(500).json({
            error: "Database error"
        });
    }
};


const updateDate = async(req,res)=>{
         const { Mnumber, receiveDate} = req.body;
         const conn = await pool.getConnection();
             const {
        id: sesid,
        role: sesrole,
        name: name,
        dept: sesdept,
        ext:ext,
    } = req.session.user;


         try{
            await conn.beginTransaction();

            await conn.query('Update requests set receiveDate=? where Mnumber=?',[receiveDate,Mnumber])
            await conn.query(`UPDATE stage_track SET stage = "PL1", is_read=0, email_sent=0,is_plan=0 WHERE MNumber = ? `,[ Mnumber,]);
            const [stageid] = await pool.query(
                    "SELECT id FROM stage_track WHERE MNumber = ?",
                    [Mnumber]
                );

                await conn.query(
                    `INSERT INTO approval_history
                    (stage_id, MNumber, employee_id,approval_name, dep, approve_datetime, ext, action, stage, remark)
                    VALUES (?,?,?,?,?,?,?,?,?,?)`,
                    [
                        stageid[0].id,
                        Mnumber,
                        sesid,
                        name,
                        sesdept,
                        new Date(),
                        ext,
                        "Approved",
                        "I1",
                        ""
                    ]
                );



                const tos = [];


                    const [listemail] = await conn.query(
                        `SELECT l.email
                        FROM user_list AS l
                        INNER JOIN user_roles AS r
                            ON l.employee_id = r.employee_id    
                        WHERE l.active = 1
                        AND l.dept = 'Planning'`
                    );

                listemail.forEach(e => {
                    if (e.email && e.email.trim() !== '') {
                        tos.push(e.email);
                    }
                });

                const [requestor] = await conn.query(
                    'SELECT req_dep, req_name FROM requests WHERE MNumber=? LIMIT 1',
                    [Mnumber]
                );

                const [remarks] = await conn.query(
                    'SELECT remark FROM requests_detail WHERE MNumber=? LIMIT 1',
                    [Mnumber]
                );
                                const now = new Date();

                    const thisdate =
                        String(now.getDate()).padStart(2, '0') + '/' +
                        String(now.getMonth() + 1).padStart(2, '0') + '/' +
                        now.getFullYear() + ' ' +
                        String(now.getHours()).padStart(2, '0') + ':' +
                        String(now.getMinutes()).padStart(2, '0') + ':' +
                        String(now.getSeconds()).padStart(2, '0');
   
        // const tos = listemail.map(e => e.email);
            await sendEmail.sendEmail({
                to: tos,
                subject: `Approval application EXTRA BOARD (MTS) ${Mnumber} is pending`,
                html: approvalEmail.dateUpdated({
                        Mnumber: Mnumber,
                        DEP: 'Planning',
                        Reqdep: requestor[0]?.req_dep || '',
                        Reqname: requestor[0]?.req_name || '',
                        Date: thisdate,
                        Remark: remarks[0]?.remark || '',
                        name:name
                })
            })



    }catch(err){

    console.log(err);
    res.status(500).send("Error processing approval");


    }
     finally {

        // release connection back to pool
        conn.release();

    }

 res.redirect('/E-mts/board/list-board-admin');

}



const boardReceived = async (req, res) => {

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
             SET stage = 'R1',
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
                "W1",
                ""
            ]
        );

        await connection.query(
            `UPDATE requests
             SET M_status = 'Approved'
             WHERE MNumber = ?`,
            [Mnumber]
        );



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


const cancleRequest = async (req, res) => {

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

        // Reject request details
        await connection.query(
            `UPDATE requests_detail
             SET status = ?
             WHERE MNumber = ?`,
            [
                "reject",
                Mnumber
            ]
        );

                    // rejected
             await connection.query(
                    `UPDATE requests
                    SET M_status = ?
                    WHERE MNumber = ? `,
                    [
                        "Rejected",
                        Mnumber,
                        
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
                "R2",
                Mnumber
            ]
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
            VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                stageid[0].id,
                Mnumber,
                sesid,
                name,
                sesdept,
                new Date(),
                ext,
                "Rejected",
                "PL3",
                ""
            ]
        );

        await connection.commit();

        res.json({
            success: true
        });

    } catch (error) {

        await connection.rollback();

        console.error("Cancel request error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        connection.release();

    }
}


const fetchHistory = async (req, res) => {

    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

    let sql = '';
    let params = [];
        let date = new Date();

        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();

        date = `${yyyy}-${mm}`;

    try {

        if (sesdept === "Production") {

            sql = `
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
                WHERE s.stage IN ('R1', 'R2')
                ORDER BY r.req_datetime DESC
            `;

        } else {

         sql = `
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
                WHERE s.stage IN ('R1','R2')
                AND (r.req_dep = ? OR r.approve_dep = ?) 
                ORDER BY r.req_datetime DESC
            `;

            params = [sesdept,sesdept];
        }

        const [Requests] = await pool.query(sql, params);

              // update notification badge

     await pool.query(
                    `UPDATE stage_track
                    SET email_sent = 1
                    WHERE email_sent = 0
                    AND stage  IN ('R1', 'R2')`);

        res.render('../views/Others/history-admin.ejs', {
            Requests,
            user: req.session.user,
            date
        });

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

                    if(sesdept ==="Production"){

                    }else{
                        conditions.push(`(r.req_dep = ? OR r.approve_dep = ?)`)
                        params.push(sesdept, sesdept);
                    }

                    // Month condition
                    conditions.push(`r.issuedate >= ?`);
                    conditions.push(`r.issuedate < ?`);

                    params.push(proddate1, proddate2);

                    // Status condition
                    if (stat !== "All") {
                        conditions.push(`r.M_status = ?`);
                        params.push(stat);

                    }else{
                        conditions.push(`s.stage IN ('R1', 'R2')`);


                    }

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


module.exports={
AdminRequest,
approvalform,
submitApproval,
GouserManagement,
addUser,
editUser,
switchUser,
GoJOC,
addJOC,
editJOC,
switchJOC,
fetchItem,
fetchStage,
fetchDates,
updateDate,
boardReceived,
fetchHistory,
fetchfail,
fetchFilter,
deleteUser,
cancleRequest,
GotoDept,
editdept,
addDept,
switchDept,
deleteJOC


}