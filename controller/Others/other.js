const bodyParser = require('body-parser');
const pool = require('../../database');
const sendEmail = require('../../service/emailsetup')
const approvalEmail = require('../../email/emailRequestor')

const logActivity= require('../../utils/log')


const homepage = async (req, res) => {

    const { id: sesid } = req.session.user;

    let totalActive = 0;
    let totalComplete = 0;

    try {

        const [requests] = await pool.query(
            `SELECT COUNT(*) AS total_active
             FROM stage_track
             WHERE stage NOT IN ('R1', 'R2')
             AND is_read = 0
             AND employee_id = ?`,
            [sesid]
        );

        const [completed] = await pool.query(
            `SELECT COUNT(*) AS total_comp
             FROM stage_track
             WHERE stage IN ('R1', 'R2')
             AND is_read = 0
             AND employee_id = ?`,
            [sesid]
        );

        totalActive = requests[0].total_active;
        totalComplete = completed[0].total_comp;

        console.log(totalActive,totalComplete)

    } catch (error) {

        console.error("Homepage error:", error);

    }

    res.render('../views/Others/homepageAdmin.ejs', {
        user: req.session.user,
        totalActive,
        totalComplete
    });
};



const homepage_supervisor = async(req,res)=>{
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

        if(sesdept === 'Production'){

        const [requests] = await pool.query(
            `SELECT COUNT(*) AS total_active
             FROM stage_track
             WHERE stage NOT IN ('R1', 'R2') AND email_sent=0`
        );

        const [done] = await pool.query(
            `SELECT COUNT(*) AS total_comp
             FROM stage_track
             WHERE stage IN  ('R1', 'R2') AND email_sent=0`
        );

        totalActive = requests[0].total_active;
        totalComplete = done[0].total_comp;



        }else{
            const [requests] = await pool.query(
                `SELECT COUNT(*) AS total_active
                 FROM stage_track s
                 INNER JOIN requests r
                     ON s.MNumber = r.MNumber
                 WHERE s.stage NOT IN ('R1', 'R2')
                 AND (r.req_dep = ? OR r.approve_dep = ?) AND email_sent=0`,
                [sesdept, sesdept]
            );

            const [done] = await pool.query(
                `SELECT COUNT(*) AS total_comp
                 FROM stage_track s
                 INNER JOIN requests r
                 ON s.MNumber = r.MNumber
                 WHERE s.stage IN ('R1', 'R2')
                 AND (r.req_dep = ? OR r.approve_dep = ?) AND email_sent=0`,
                [sesdept, sesdept]
            );

       totalActive = requests[0].total_active;
       totalComplete = done[0].total_comp;




        }

    }catch(error){


         console.error("Homepage error:", error);

    }

res.render('../views/Others/homepageSupervisor.ejs',{
        user: req.session.user,
        totalActive,
        totalComplete
    });


}



const homepage_user = async (req,res)=>{
    const {
        id: sesid,
        role: sesrole,
        name: name,
        dept: sesdept,
        ext:ext,
    } = req.session.user;


    try {
       

        const [requests] = await pool.query(
            `SELECT COUNT(*) AS total_active
             FROM stage_track
             WHERE stage NOT IN ('R1', 'R2') AND is_read=0
             AND employee_id = ?`,
            [sesid]
        );

        const [completed] = await pool.query(
            `SELECT COUNT(*) AS total_comp
             FROM stage_track
             WHERE stage  IN ('R1', 'R2') AND is_read=0
             AND employee_id = ?`,
            [sesid]
        );

        const totalActive = requests[0].total_active;
        const totalComplete = completed[0].total_comp;

        res.render('../views/Others/homepageUser.ejs', {
            user: req.session.user,
            totalActive,
            totalComplete
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }

}





const request = async (req, res) => {

    try {

        let serial
         
    if(!req.session.Mnumber){

        const [result] = await pool.query(
            "INSERT INTO serial_counter VALUES ()"
        );
        serial = formatSerial(result.insertId );
         req.session.Mnumber = serial;


    }else{


        serial =req.session.Mnumber
    }



         



res.render('../views/Others/e-mts', {
    user: req.session.user,
    serial: serial,
    success: req.flash('success')
});

    } catch (error) {

        console.error(error);

        res.status(500).send("Error generating serial");

    }

};

function formatSerial(id) {

    const num = String(id + 1000).padStart(6, "0");

    return `L${num.slice(0, 3)}${num.slice(3, 6)}`;
}



const getdetails = async(req,res)=>{

    try{

    const itemno = req.params.itemdata;

const [results] = await pool.query(
    `SELECT *
     FROM import_pwb
     WHERE M_NO = ?
     ORDER BY import_time DESC
     LIMIT 1`,
    [itemno]
);
    res.json(results);
    }catch(error){

               console.error(error);
        res.status(500).json({
            error: "Database error"
        });


    }



}

const verifyJOC = async(req,res)=>{


    try{

    const joc = req.params.joc;
    const [results] = await pool.query(
    "SELECT DEP FROM JOC WHERE JOC=? AND active=?  Limit 1",
    [joc,1]
);
    res.json(results);




    }catch(error){

        console.error(error);
        res.status(500).json({
            error: "Database error"
        });



    }

}

const submitRequest = async(req,res)=>{

    try{

    const { requestorName, requestorID,requestorDep,requestorExt,requestorDateTime,mtsno,returnjoc,issuejoc,spoilagejoc,jocdet,itemno,itemdesc,
        itemcat,reqqty,remark
     } = req.body;

        await pool.query(
            `INSERT INTO requests 
            (MNumber, req_id, req_name, req_dep, req_ext, req_datetime, issuedate, returnjoc, issuejoc, spoilagejoc,approve_dep)
            VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)`,
            [
                mtsno,
                requestorID,
                requestorName,
                requestorDep,
                requestorExt,
                requestorDateTime,
                returnjoc,
                issuejoc,
                spoilagejoc,
                jocdet
            ]
        );

for(let x = 0; x < itemno.length; x++){

    await pool.query(
        `INSERT INTO requests_detail
        (MNumber,itemno,itemdesc,itemcat,reqqty,remark)
        VALUES (?,?,?,?,?,?)`,
        [
            mtsno,
            itemno[x],
            itemdesc[x],
            itemcat[x],
            reqqty[x],
            remark[x]
        ]
    );

}

   await pool.query(
        `INSERT INTO stage_track
        (employee_id,MNumber,stage)
        VALUES (?,?,?)`,
        [
            requestorID,
            mtsno,
            "I1"
            
        ]
    );

            const tos = [];

            const [listemail] = await pool.query(
                `SELECT l.email
                FROM user_list AS l
                INNER JOIN user_roles AS r
                    ON l.employee_id = r.employee_id
                WHERE l.active = 1
                AND r.role_scope = 'Approval'
                AND l.dept = ?`,
                [jocdet]
            );

                listemail.forEach(e => {
                    if (e.email && e.email.trim() !== '') {
                        tos.push(e.email);
                    }
                });
   
        // const tos = listemail.map(e => e.email);
            await sendEmail.sendEmail({
                to: tos,
                subject: `EMTS NEW REQUEST ${mtsno}`,
                html: approvalEmail.approvalEmail({
                    Mnumber: mtsno,
                    DEP: jocdet
                })
            });


     delete req.session.Mnumber;


    req.flash('success', 'Request Submitted');

    res.redirect('/E-mts/board/request-board');
    }catch(error){

        console.error(error);

        res.status(500).send("Database error");


    }


}


const reubmitform = async (req, res) => {

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
            `,
            [Mnumber]
        );

        if (Requests.length === 0) {
            return res.status(404).send("Request not found");
        }

        reqdetail = Requests[0];

        return res.render("../views/Others/e-mts-resubmit", {
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


const ResubmitRequest = async (req, res) => {

    const {
        id: sesid,
        role: sesrole,
        name,
        dept: sesdept,
        ext
    } = req.session.user;

    const {
        requestorName,
        requestorID,
        requestorDep,
        requestorExt,
        requestorDateTime,
        mtsno,
        returnjoc,
        issuejoc,
        spoilagejoc,
        jocdet,
        itemno,
        itemdesc,
        itemcat,
        reqqty,
        remark
    } = req.body;

    const connection = await pool.getConnection();

    try {

        // Make sure item arrays exist
        if (
            !Array.isArray(itemno) ||
            !Array.isArray(itemdesc) ||
            !Array.isArray(itemcat) ||
            !Array.isArray(reqqty) ||
            !Array.isArray(remark)
        ) {
            return res.status(400).send("Invalid item data");
        }

        // Make sure all item arrays have the same number of rows
        if (
            itemno.length !== itemdesc.length ||
            itemno.length !== itemcat.length ||
            itemno.length !== reqqty.length ||
            itemno.length !== remark.length
        ) {
            return res.status(400).send("Invalid item data");
        }

        if (!mtsno) {
            return res.status(400).send("MNumber is required");
        }

        // Start transaction
        await connection.beginTransaction();

        // --------------------------------------------------
        // 1. UPDATE MAIN REQUEST
        // --------------------------------------------------

        await connection.query(
            `UPDATE requests
             SET
                req_datetime = ?,
                issuedate = CURDATE(),
                returnjoc = ?,
                issuejoc = ?,
                spoilagejoc = ?,
                approve_dep = ?
             WHERE MNumber = ?`,
            [
                requestorDateTime,
                returnjoc,
                issuejoc,
                spoilagejoc,
                jocdet,
                mtsno
            ]
        );


        // --------------------------------------------------
        // 2. CHANGE OLD CANCELLED DETAILS TO "old"
        // --------------------------------------------------

        await connection.query(
            `UPDATE requests_detail
             SET status = ?
             WHERE MNumber = ?
             AND status = ?`,
            [
                "old",
                mtsno,
                "cancle"
            ]
        );


        // --------------------------------------------------
        // 3. INSERT NEW REQUEST DETAILS
        // --------------------------------------------------

        for (let x = 0; x < itemno.length; x++) {

            await connection.query(
                `INSERT INTO requests_detail
                (
                    MNumber,
                    itemno,
                    itemdesc,
                    itemcat,
                    reqqty,
                    remark
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    mtsno,
                    itemno[x],
                    itemdesc[x],
                    itemcat[x],
                    reqqty[x],
                    remark[x]
                ]
            );

        }

        // --------------------------------------------------
        // 3.1. Update current Track
        // --------------------------------------------------


            await connection.query(
                `UPDATE stage_track
                SET stage = ?
                WHERE MNumber = ?`,
                [
                    "I1",
                    mtsno
                ]
            );


        // --------------------------------------------------
        // 4. COMMIT DATABASE CHANGES
        // --------------------------------------------------

        await connection.commit();


        // --------------------------------------------------
        // 5. GET ADMIN EMAILS
        // --------------------------------------------------

        const tos = [];

        const [listemail] = await pool.query(
            `SELECT l.email
             FROM user_list AS l
             INNER JOIN user_roles AS r
                 ON l.employee_id = r.employee_id
             WHERE l.active = 1
             AND r.role_scope = 'Requestor'
             AND l.dept = ?`,
            [jocdet]
        );


        listemail.forEach(e => {

            if (e.email && e.email.trim() !== '') {
                tos.push(e.email);
            }

        });




        // --------------------------------------------------
        // 6. SEND EMAIL
        // --------------------------------------------------

        if (tos.length > 0) {

            await sendEmail.sendEmail({
                to: tos,
                subject: `EMTS REQUEST RESUBMITED ${mtsno}`,
                html: approvalEmail.approvalEmail({
                    Mnumber: mtsno,
                    DEP: jocdet
                })
            });

        }


        // --------------------------------------------------
        // 7. REDIRECT
        // --------------------------------------------------

        if (sesrole === "Admin") {

            return res.redirect('/E-mts/board/list-board-admin');

        } else {

            return res.redirect('/E-mts/board/list-board-user');

        }


    } catch (error) {

        // Rollback database changes if anything fails
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error("Rollback error:", rollbackError);
        }

        console.error("ResubmitRequest error:", error);

        return res.status(500).send("Database error");

    } finally {

        // Always release connection
        connection.release();

    }

};


const goUploadPage = (req,res)=>{

        res.render('../views/Others/upload.ejs', {
            user: req.session.user
        });

}


const Uploading = async (req,res)=>{
    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

    try {

       const excelData = JSON.parse(req.body.excelData);

       const filepath = req.file.path;

            excelData.forEach(row => {
                row.filepath = filepath;
            });
       console.log(filepath)
        const response = await fetch(
            'http://43.74.21.225/pwb/pwbAPI.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(excelData)
            }
        );

            const result = await response.text();

                    if (!response.ok) {
            return res.status(500).json({
                success: false,
                message: result
            });
        }

            if (result === 'OK') {
                 await logActivity(req,'UPLOAD_EXCELL','Excell_File',filepath,'Production Upload Excell File','SUCCESS')

                res.json({
                    success: true,
                    data: result
                });

            } else {

                res.json({
                    success: false,
                    data: result
                });

            }

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: 'Failed to send data to PWB API'
        });

    }

 
}


module.exports={
homepage,
homepage_user,
request,
getdetails,
verifyJOC,
submitRequest,
reubmitform,
ResubmitRequest,
homepage_supervisor,
goUploadPage,
Uploading


}

