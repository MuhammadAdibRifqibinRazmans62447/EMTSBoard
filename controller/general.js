const bodyParser = require('body-parser');
const pool = require('../database');




const hub = (req,res)=>{

res.render('../views/mtshub');


}



const login = (req,res)=>{
    const alert = req.session.alert;
    req.session.alert = null;

res.render('../views/login',{ alert });


}



const  login_post = async (req,res)=>{

    const { username, password } = req.body;

    try{

        const [user] = await pool.query("Select * From user_list where employee_id=?",[username]);

          if (user.length === 0) {
                return res.status(401).send('<script>alert("Incorrect Username"); window.history.back();</script>');
            }

        const details = user[0];

        if(details.password !== password){

            return res.status(401).send('<script>alert("Incorrect Password"); window.history.back();</script>');
        }

        if(details.active === 0){

            return res.status(401).send('<script>alert("Acount Deactivated Please Contact Your Superior"); window.history.back();</script>');
        }
         if(details.active === 2){

            return res.status(401).send('<script>alert("User is not exist"); window.history.back();</script>');
        }




                const [roles] = await pool.query(
                    "SELECT role_name, role_scope FROM user_roles WHERE employee_id=?",
                    [username]
                );

                const [exts] = await pool.query(
                    "SELECT EXT FROM department WHERE dep_name=?",
                    [details.dept]
                );

                const role = roles[0].role_name;
                const rc = roles[0].role_scope;
                const ext = exts[0];

                req.session.user = {
                    id: details.employee_id,
                    name: details.name,
                    dept: details.dept,
                    role: role,
                    rc: rc,
                    ext: ext.EXT
                };
            console.log(req.session.user);

                                await pool.query(
                                    `INSERT INTO activity_logs
                                    (employee_id, employee_name, role, action, target_type, target_id, description, status, ip_address)
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [
                                        req.session.user.id,
                                        req.session.user.name,
                                        req.session.user.role,
                                        'LOGIN_SUCCESS',
                                        'USER',
                                        req.session.user.rc,
                                        'User logged in successfully',
                                        'SUCCESS',
                                        req.ip
                                    ]
                                );


                    if (rc === "Planning") {

                        return res.redirect("/E-mts/planning/dashboard");

                    } else if (rc === "Requestor") {

                        return res.redirect("/E-mts/board/dashboard/admin");

                    } else if (rc === "Approval") {

                        return res.redirect("/E-mts/board/dashboard/Supervisor");

                    }



    
    }catch(error){
       
        console.error('Error:', error);
        res.status(500).send('Internal server error');


    }




}





// const homepage = (req,res)=>{

// res.render('../views/Requestor/homepage');


// }


// const request = (req,res)=>{

// res.render('../views/Requestor/e-mts');


// }

// const requestList = (req,res)=>{

// res.render('../views/Requestor/list');


// }


// const historylist = (req,res)=>{

// res.render('../views/Requestor/history');


// }



module.exports={
hub,
login,
login_post,


}