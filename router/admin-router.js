const express= require("express");
const router= express.Router();

//*----------------------------------*
// Require controller and Middleware//
//*----------------------------------*
// Admin controller all logic here
const adminController= require("../controllers/admin-controller");
//check the toke is verified or not
const userMiddleware =require("../middlewares/user-auth-middleware");
// admin are not verified that logic
const adminMiddleware =require("../middlewares/auth-admin-middleware");


//*-----------------------------*
// saving Account Admin  Logic //
//*-----------------------------*
const AdminCreateAccount= require("../controllers/Admin-CreateAccount-controller");
//for ZOD Validation
const {ValidateSavingAccountSchema}= require("../validators/saving-account-validator");
const validate = require("../middlewares/auth-middleware");

//*-----------------------------------*
// Create Account  maintain by Admin //
//*-----------------------------------*
router.route("/admincreateaccount").post(userMiddleware,adminMiddleware,validate(ValidateSavingAccountSchema),AdminCreateAccount);
//Customer Information Form
//router.route("/admincreateaccount").post(userMiddleware,adminMiddleware,AdminCreateAccount);
//Customer Money Deposit Logic 
router.route("/deposit").patch(userMiddleware,adminMiddleware,adminController.Deposit);
//Customer Money Deposit Logic 
router.route("/withdraw").patch(userMiddleware,adminMiddleware,adminController.Withdraw);
//Toatal Monthly Audit Logic
//Customer Money Deposit Logic 
router.route("/transactionhistory/:account_no").get(userMiddleware,adminMiddleware,adminController.Transactionhistory);
router.route("/transactionhistory/delete/:id").delete(userMiddleware, adminMiddleware, adminController.deleteTransactionData);
//Customer Money Deposit Logic 
router.route("/findAccount").get(userMiddleware,adminMiddleware,adminController.FindAccount);

//*------------------------------------------*
// Saving Account Data Fetch,Update,Delete //
//*------------------------------------------*
//Get all users data fetch
router.route("/allConsumers").get(userMiddleware,adminMiddleware,adminController.getAllConsumers);
//single data fetch for Consumer logic
router.route("/allConsumers/:id").get(userMiddleware,adminMiddleware,adminController.singleConsumerData);
//update Consumer data
router.route("/allConsumers/update/:id").patch(userMiddleware,adminMiddleware,adminController.updateConsumerData);
// delete consumer data
router.route("/allConsumers/delete/:id").delete(userMiddleware,adminMiddleware,adminController.deleteConsumerData);

//*--------------------------------------------------------*
// Data Retrieve Logic For Admin Data Fetch,Update,Delete //
//*-------------------------------------------------------*
//Get all users data fetch
router.route("/users").get(userMiddleware,adminMiddleware,adminController.getAllUsers);
//single data fetch
router.route("/users/:id").get(userMiddleware,adminMiddleware,adminController.singleConsumerData);
//update user data
router.route("/users/update/:id").patch(userMiddleware,adminMiddleware,adminController.updateUserData);
// delete routes create
router.route("/users/delete/:id").delete(userMiddleware,adminMiddleware,adminController.deleteUserById);


//*-----------------------------*
// Loan Account Admin  Logic   //
//*-----------------------------*
const {AdminCreateLoanAccount,LoanCredit,LoanDeposit,GetAllLoanHolders,LoanTransactionhistory,deleteTransactionLoanData,LoanMonthlyAudit}= require("../controllers/Admin-Create-Loan-Account-controller");
//for ZOD Validation
const {ValidateLoanAccountSchema }= require("../validators/loan-account-validator");
//*-----------------------------------*
// Create Loan Account  maintain by Admin //
//*-----------------------------------*

//Customer Loan Information Form
router.route("/admincreateloanaccount").post(userMiddleware,adminMiddleware,validate(ValidateLoanAccountSchema),AdminCreateLoanAccount);
//Customer Money Deposit Logic 
router.route("/loancredit").patch(userMiddleware,adminMiddleware,LoanCredit);
//Customer Money Deposit Logic 
router.route("/loandeposit").patch(userMiddleware,adminMiddleware,LoanDeposit);
//Customer Money Deposit Logic 
router.route("/getallloanholders").get(userMiddleware,adminMiddleware,GetAllLoanHolders);
router.route("/getallloanholders/delete/:id").delete(userMiddleware,adminMiddleware,deleteTransactionLoanData);
router.route("/transactionloanhistory/:account_no").get(userMiddleware,adminMiddleware,LoanTransactionhistory);
router.route("/loanmonthlyAudit").get(userMiddleware,adminMiddleware,LoanMonthlyAudit);






//*-----------------------------*
// Investment Account Admin  Logic   //
//-----------------------------*
const {AdminCreateInvestmentAccount,deleteTransactionInvestmentData,ProfitOnCustomerInvestment,GetInvestmentAccountHolders,TransactionInvestmentHistory}=require("../controllers/Admin-create-Investment-Account");
//for ZOD Validation
const {ValidateInvestmentAccountSchema}= require("../validators/invest-account-validator");
 
//*-----------------------------------*
// Create Profit Account  maintain by Admin //
//*-----------------------------------*

router.route("/createinvestmentaccount").post(userMiddleware,adminMiddleware,validate(ValidateInvestmentAccountSchema),AdminCreateInvestmentAccount);
router.route("/profitoncustomerinvestment").patch(userMiddleware,adminMiddleware,ProfitOnCustomerInvestment);
router.route("/getallinvestments").get(userMiddleware,adminMiddleware,GetInvestmentAccountHolders);
router.route("/transactioninvestnhistory/:account_no").get(userMiddleware,adminMiddleware,TransactionInvestmentHistory);
router.route("/getallinvestments/delete/:id").delete(userMiddleware, adminMiddleware, deleteTransactionInvestmentData);


module.exports = router;

