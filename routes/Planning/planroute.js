const express = require('express');
const router = express.Router();
const controller = require('../../controller/general');
const contollerP = require('../../controller/Planning/planningController');
const authCheck = require('../../middleware/authCheck');
const authRole = require('../../middleware/authRole2');

router.get('/dashboard',authCheck,authRole,contollerP.homepage);

router.get('/request-list',authCheck,authRole,contollerP.requestlist);

router.get('/fetchItems/:Mnumber',authCheck,authRole,contollerP.fetchItem);
router.get('/fetchStage/:Mnumber',authCheck,authRole,contollerP.fetchStage);
router.post('/updateImaps', contollerP.updateImaps);


router.post('/approveDate', authCheck, authRole, contollerP.approvedate);



router.get('/Go-to-edit',authCheck,authRole,contollerP.fetchUser);
router.post('/addUser', authCheck, authRole,contollerP.addUser);
router.post('/editUser', authCheck, authRole,contollerP.editUser);
router.post('/switch/:id/:active', authCheck, authRole,contollerP.switchUser);
router.post('/deleteUser/:id', authCheck, authRole,contollerP.deleteUser);



router.get('/history-planning',authCheck,authRole,contollerP.fetchHistory);

router.get('/filter/:month_select/:stat',authCheck,authRole,contollerP.fetchFilter);
router.get('/downloadData/:month_select/:stat',authCheck,authRole,contollerP.downloadData);
router.get('/downloadCurrent/:Mnumber',authCheck,contollerP.downloadCurrent);
router.post('/cancleRequest', authCheck,contollerP.cancleRequest);



//editprofile

router.get('/editProfile',authCheck,contollerP.editProfile);
router.post('/profileUser',authCheck,contollerP.changeUser);





module.exports = router;