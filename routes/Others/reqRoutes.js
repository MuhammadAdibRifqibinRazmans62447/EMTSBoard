const express = require('express');
const router = express.Router();
const controller = require('../../controller/Others/other');
const controllerUser = require('../../controller/Others/userSpecific');
const controllerAdmin = require('../../controller/Others/adminSpecifics');
const authCheck = require('../../middleware/authCheck');
const authRole = require('../../middleware/authRole');
const authSV = require('../../middleware/authSV');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// const basePath = '\\\\43.74.1.104\\Server_Backup\\PWB_file';
const basePath = '/mnt/pwb_store/PWB_file';

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        const today = new Date().toISOString().split('T')[0];

        const folderPath = path.join(
            basePath,
            today
        );

        fs.mkdirSync(folderPath, { recursive: true });

        cb(null, folderPath);
    },

    filename: function (req, file, cb) {

        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
});


const authSVAdmin =require('../../middleware/authRolesvadmin');


router.get('/dashboard/admin',authCheck,authRole,controller.homepage);
router.get('/dashboard/Supervisor',authCheck,authSV,controller.homepage_supervisor);


router.get('/list-board-user',authCheck,controllerUser.UserReqdetails);
router.get('/list-board-admin',authCheck,authSV,controllerAdmin.AdminRequest);


router.get('/history-admin',authCheck,authSV,controllerAdmin.fetchHistory);
router.get('/history-user',authCheck,authCheck,controllerUser.fetchHistoryUser);
router.get('/editProfile',authCheck,controllerUser.editProfile);
router.post('/profileUser',authCheck,controllerUser.changeUser);

// user management

router.get('/Go-to-edit',authCheck,controllerAdmin.GouserManagement);
router.post('/addUser',authCheck,controllerAdmin.addUser);
router.post('/editUser',authCheck,controllerAdmin.editUser);
router.post('/switch/:id/:active',authCheck,controllerAdmin.switchUser);
router.post('/deleteUser/:id',authCheck,controllerAdmin.deleteUser);

// sv management



// user JOC management
router.get('/Go-to-joc',authCheck,authSV,controllerAdmin.GoJOC);
router.post('/addJOC',authCheck,authSV,controllerAdmin.addJOC);
router.post('/editJOC',authCheck,authSV,controllerAdmin.editJOC);
router.post('/jocSwitch/:joc/:active',authCheck,authSV,controllerAdmin.switchJOC);
router.post('/deleteJOC/:joc',authCheck,authSV,controllerAdmin.deleteJOC);


//dept management

router.get('/GotoDept',authCheck,controllerAdmin.GotoDept);
router.post('/editdept',authCheck,controllerAdmin.editdept);
router.post('/addDept',authCheck,controllerAdmin.addDept);
router.post('/switchDept/:id/:active',authCheck,controllerAdmin.switchDept);

// submit request

router.get('/request-board',authCheck,controller.request);
router.get('/getdata/:itemdata',authCheck,controller.getdetails);
router.get('/verify/:joc',authCheck,controller.verifyJOC);
router.post('/submitRequest',authCheck,controller.submitRequest);



// approve request admin
router.get('/approvalform/:Mnumber',authCheck,authSV,controllerAdmin.approvalform);
router.post('/submitApproval',authCheck,authSV,controllerAdmin.submitApproval);
router.get('/fetchItems/:Mnumber',authCheck,controllerAdmin.fetchItem);
router.get('/fetchStage/:Mnumber',authCheck,controllerAdmin.fetchStage);
router.get('/fetchfail/:Mnumber',authCheck,controllerAdmin.fetchfail);
router.get('/fetchDates/:Mnumber',authCheck,authSV,controllerAdmin.fetchDates);
router.post('/updateDate',authCheck,authSV,controllerAdmin.updateDate);
router.post('/boardReceived',authCheck, controllerAdmin.boardReceived);
router.post('/cancleRequest',authCheck, controllerAdmin.cancleRequest);

// reubmit
router.get('/resubmitform/:Mnumber',authCheck,controller.reubmitform);
router.post('/ResubmitRequest',authCheck,controller.ResubmitRequest);


router.get('/filter/:month_select/:stat',authCheck,controllerAdmin.fetchFilter);
router.get('/filter-user/:month_select/:stat',authCheck,controllerUser.fetchFilter);


//upload

router.get('/uploadExcell',authCheck,controller.goUploadPage)
router.post('/uploadExcell',upload.single('file'),controller.Uploading);

module.exports = router;