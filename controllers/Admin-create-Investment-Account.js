const { TotalAmountModel } = require('../models/transaction-models');
const { AdminCreateInvestmentAccountModel, TotalInvestmentAmountModel,CounTeRR,TotalRecoveryInvestmentSchemaModel,RemainingInvestmentAmountModel} = require('../models/Admin-create-Investment-Account-models');
const { TransactionInvestmentAccountHistory } = require('../models/Admin-create-Investment-Account-history-models');
//const CounTer = require('../models/counter-model'); // Ensure CounTer model is imported correctly



//*-------------------------------------------------------*
//  Generate the transaction id and Unique Account number //
//*-------------------------------------------------------*
const getNextSequence = async (name) => {
  const result = await CounTeRR.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};



//*------------------------------*
//  Create Investment Account   //
//*-----------------------------*
const AdminCreateInvestmentAccount = async (req, res) => {
  try {
    const response = req.body;
    console.log('Request Body:', response);

     // Get the next account number
     const nextAccountNumber = await getNextSequence('account_no');
     response.account_no = (100000 + nextAccountNumber).toString();
 
     // Get the next transaction ID
     const nextTransactionId = await getNextSequence('transaction_no');
     response.transaction_no = `GFST${nextTransactionId}`;
     console.log('Request Body:', response);

    // Check the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      totalAmountDoc = new TotalAmountModel({ totalAmount: 0 });
    }

    // Ensure there is enough balance before creating the investment account
    if (totalAmountDoc.totalAmount < parseFloat(response.investment_of_customers_business)) {
      return res.status(400).json({ message: 'Insufficient balance. You cannot get a business purpose money.' });
    }

    // Set total investment to starting loan if starting loan is provided
    if (response.investment_of_customers_business) {
      response.individual_total__investment = response.investment_of_customers_business;
    }

    // Create the new account
    const newAccount = await AdminCreateInvestmentAccountModel.create(response);
    console.log(newAccount);

    // Deduct the investment amount from the bank's total amount
    if (response.investment_of_customers_business) {
      totalAmountDoc.totalAmount -= parseFloat(response.investment_of_customers_business);
    }

    await totalAmountDoc.save();

    // Update the total investment amount for all customers
    let totalInvestAmountDoc = await TotalInvestmentAmountModel.findOne();
    if (!totalInvestAmountDoc) {
      totalInvestAmountDoc = new TotalInvestmentAmountModel({ totalInvestmentAmount: 0 });
    }

    totalInvestAmountDoc.totalInvestmentAmount += parseFloat(response.investment_of_customers_business);
    await totalInvestAmountDoc.save();

    // Record the investment transaction
    const investmentTransaction = new TransactionInvestmentAccountHistory({
      consumer_name: response.consumer_name,
      account_no: response.account_no,
      transaction_no: response.transaction_no,
      type: 'investment_of_customers_business',
      date: new Date(),
      address: response.address,
      aadhar_no: response.aadhar_no,
      mobile_no: response.mobile_no,
      mail_id: response.mail_id,
      remarks: 'starting_loan',
      individual_total__investment: response.individual_total__investment,
      investment_of_customers_business: parseFloat(response.investment_of_customers_business),
      totalInvestmentAmount: totalInvestAmountDoc.totalInvestmentAmount // Ensure this assignment is correct
    });

    // Log the transaction to verify
    console.log('Investment Transaction:', investmentTransaction);

    await investmentTransaction.save();

    res.status(200).json({
      msg: "Admin Create Account Successfully",
      totalInvestmentAmount: totalInvestAmountDoc.totalInvestmentAmount
    });
  } catch (error) {
    res.status(500).json({ msg: "Admin Account not Created", error: error.message });
  }
};



//*--------------------------------------*
//  Customer profit add on TotalAmount   //
//*--------------------------------------*
const ProfitOnCustomerInvestment = async (req, res) => {
  try {
    const { account_no, profit_on_customer_investment, consumer_name, transaction_no } = req.body;

    // Find the account
    let account = await AdminCreateInvestmentAccountModel.findOne({ account_no });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Initialize total_loan_credit if it's undefined
    if (typeof account.individual_total__investment === 'undefined') {
      account.individual_total__investment = 0;
    }

    // Check if the profit_on_customer_investment  is greater than the Individual_total__investment
    if (account.individual_total__investment < parseFloat(profit_on_customer_investment)) {
      return res.status(400).json({ message: 'All profit already added' });
    }

    // Update the total loan credit and amount_of_loan_recovery
    account.individual_total__investment -= parseFloat(profit_on_customer_investment);
    account.amount_of_investment_recovery= (account.amount_of_investment_recovery || 0) + parseFloat(profit_on_customer_investment);
    account.profit_on_customer_investment = parseFloat(profit_on_customer_investment); // Update the loan_deposit in the account

    // Save the updated account
    await account.save();

// Update the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
     totalAmountDoc = new TotalAmountModel({ totalAmount: 0 });
    }
     totalAmountDoc.totalAmount += parseFloat(profit_on_customer_investment);
     await totalAmountDoc.save()

    // Update the total loan amount for all customers (RecoveryInvestmentAmountModel)
    let totalRecoveryInvestmentAmountDoc = await TotalRecoveryInvestmentSchemaModel.findOne();

    if (!totalRecoveryInvestmentAmountDoc) {
      totalRecoveryInvestmentAmountDoc  = new TotalRecoveryInvestmentSchemaModel({ recoveryInvestmentTotalAmount: 0 });
    }
  
    totalRecoveryInvestmentAmountDoc.recoveryInvestmentTotalAmount += parseFloat(profit_on_customer_investment);
    await totalRecoveryInvestmentAmountDoc .save();

    
    // Calculate remaining  Investment amount
    let totalInvestmentAmountDoc= await TotalInvestmentAmountModel.findOne();

    if (!totalInvestmentAmountDoc) {
      totalInvestmentAmountDoc = new TotalInvestmentAmountModel({ totalInvestmentAmount: 0 });
    }

    let remainingTotalAmount = totalInvestmentAmountDoc.totalInvestmentAmount - totalRecoveryInvestmentAmountDoc.recoveryInvestmentTotalAmount ;

    // Save remaining loan amount to RemainingLoanAmountModel
    let remainingInvestmentAmountDoc = await RemainingInvestmentAmountModel.findOneAndUpdate(
      {},
      { remainingTotalAmount },
      { new: true, upsert: true }
    );

    // Record the loan deposit transaction
    const  TransactionInvestmentHistory = new TransactionInvestmentAccountHistory({
      consumer_name,
      transaction_no,
      account_no,
      type: 'profit_on_customer_investment',
      profit_on_customer_investment: parseFloat(profit_on_customer_investment),
      date: new Date(),
      remarks: 'profit_on_customer_investment',
      individual_total__investment:account.individual_total__investment,
      amount_of_investment_recovery: account.amount_of_investment_recovery,
      recoveryInvestmentTotalAmount:totalRecoveryInvestmentAmountDoc.recoveryInvestmentTotalAmount,
      remainingTotalAmount: remainingInvestmentAmountDoc.remainingTotalAmount // Include remainingLoanAmount in transaction history
    });

    await TransactionInvestmentHistory.save();
    console.log(TransactionInvestmentHistory )

    res.json({
      message: 'Loan deposit successful',
      individual_total__investment:account.individual_total__investment,
      amount_of_investment_recovery: account.amount_of_investment_recovery,
      recoveryInvestmentTotalAmount:totalRecoveryInvestmentAmountDoc.recoveryInvestmentTotalAmount,
      remainingTotalAmount: remainingInvestmentAmountDoc.remainingTotalAmount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//*--------------------------------------*
// Retrieve  All Loan Holders Account   //
//*--------------------------------------*
const GetInvestmentAccountHolders =async(req,res)=>{
  try {
    const users= await AdminCreateInvestmentAccountModel.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No consumers found" });
    }

    const totalAmountDoc = await TotalAmountModel.findOne();
    const totalAmount = totalAmountDoc ? totalAmountDoc.totalAmount : 0;

    
    const totalInvestmentAmountDoc = await TotalInvestmentAmountModel.findOne();
    const totalInvestmentAmount = totalInvestmentAmountDoc? totalInvestmentAmountDoc.totalInvestmentAmount : 0;

    
    const totalRecoveryInvestmentAmountDoc = await TotalRecoveryInvestmentSchemaModel.findOne();
    const recoveryInvestmentTotalAmount  = totalRecoveryInvestmentAmountDoc ? totalRecoveryInvestmentAmountDoc.recoveryInvestmentTotalAmount : 0;
    
    const remainingInvestmentAmountDoc = await RemainingInvestmentAmountModel.findOne();
    const remainingTotalAmount= remainingInvestmentAmountDoc ? remainingInvestmentAmountDoc.remainingTotalAmount: 0;

    res.status(200).json({ users, totalAmount,totalInvestmentAmount,recoveryInvestmentTotalAmount,remainingTotalAmount });

  } catch (error) {
    next(error);
  }
}



//*----------------------------------------*
// Retrieve All Loan Holders transaction   //
//*----------------------------------------*
const TransactionInvestmentHistory  = async (req, res) => {
  try {
    const { account_no } = req.params;
    console.log(`Fetching transaction history for account: ${account_no}`); // Log for debugging
    const transactions = await TransactionInvestmentAccountHistory.find({ account_no });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Fetch account details to get total_bal
    const account = await AdminCreateInvestmentAccountModel.findOne({ account_no });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Add total_bal to each transaction object
    const transactionsWithTotalBal = transactions.map(transaction => ({
      ...transaction.toObject(),
      total_bal: account.total_bal,
    }));

    res.json(transactionsWithTotalBal);

  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//*----------------------------*
// delete  consumer loan  data     //
//*---------------------------*
const deleteTransactionInvestmentData = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the account to get its total loan credit
    const account = await AdminCreateInvestmentAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    if (account.individual_total__investment==0) {
      // Delete the account
      await AdminCreateInvestmentAccountModel.deleteOne({ _id: id });
      return res.status(200).json({ message: "Consumer deleted successfully" });
    } else {
      return res.status(400).json({ message: "Conditions not met for deletion" });
    }
  } catch (error) {
    next(error);
  }
}



module.exports = {AdminCreateInvestmentAccount,
  ProfitOnCustomerInvestment,
  GetInvestmentAccountHolders,
  TransactionInvestmentHistory ,
  deleteTransactionInvestmentData};
