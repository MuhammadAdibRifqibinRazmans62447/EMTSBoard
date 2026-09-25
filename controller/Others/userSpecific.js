const bodyParser = require('body-parser');
const pool = require('../../database');
const logActivity= require('../../utils/log')

const UserReqdetails = async (req,res)=>{

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
  AND r.req_id = ?
ORDER BY r.req_datetime DESC;
`,
[sesid]
);

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
    
// update notification become 1

await pool.query(
    `UPDATE stage_track
     SET is_read = 1
     WHERE is_read = 0
     AND employee_id = ?
     AND stage NOT IN ('R1', 'R2')`,
    [sesid]
);

}catch(error){

}    

console.log('frethc user');
res.render('../views/Others/Userlist.ejs',{Requests,I1,PL1,PL2,total,PL3,W1,
        user: req.session.user
    });


}

const fetchHistoryUser = async (req, res) => {

    const { id: sesid, role: sesrole, dept: sesdept } = req.session.user;

    let sql = '';
    let params = [];
        let date = new Date();

        let dd = String(date.getDate()).padStart(2, '0');
        let mm = String(date.getMonth() + 1).padStart(2, '0');
        let yyyy = date.getFullYear();

        date = `${yyyy}-${mm}`;

    try {


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
                AND r.req_id = ?
                ORDER BY r.req_datetime DESC
            `;

            params = [sesid];
        

        const [Requests] = await pool.query(sql, params);

        // update notification become 1

                await pool.query(
                    `UPDATE stage_track
                    SET is_read = 1
                    WHERE is_read = 0
                    AND employee_id = ?
                    AND stage IN ('R1', 'R2')`,
                    [sesid]
                );

        res.render('../views/Others/history-user.ejs', {
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

                 

                        conditions.push(`r.req_id = ?`)
                        params.push(sesid);
                    

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

        res.render('../views/Others/editprofile.ejs', {
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

          await logActivity(req,'EDIT_Profile','USER',employee_id,'USER Edit Profile','SUCCESS')
        req.flash('success', 'User updated successfully');

        res.redirect('/E-mts/board/editProfile');

    } catch (error) {

        console.error(error);

        req.flash('error', 'Failed to update user');

        res.redirect('/E-mts/board/editProfile');
    }
};

module.exports={
UserReqdetails,
fetchHistoryUser,
fetchFilter,
editProfile,
changeUser


}