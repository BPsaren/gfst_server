
const { TotalAmountModel } = require('../models/transaction-models');
const { AdminCreateLoanAccountModel, CounTer, TotalLoanAmountModel,RecoveryLoanAmountModel,RemainingLoanAmountModel } = require('../models/loan-transaction-models');
const TransactionLoanHistory = require('../models/loan-transaction-history-models');



//*--------------------------------------------------------*
// Generate the Transaction id and Unique Account Number  //
//*--------------------------------------------------------*
const getNextSequence = async (name) => {
  const result = await CounTer.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};



//*------------------------*
// create Loan Account   //
//*-----------------------*
const AdminCreateLoanAccount = async (req, res) => {
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

    // Ensure there is enough balance before creating the loan account
    if (totalAmountDoc.totalAmount < parseFloat(response.starting_loan)) {
      return res.status(400).json({ message: 'Insufficient balance. You cannot get a loan.' });
    }

    // Set total_loan_credit to starting_loan if starting_loan is provided
    if (response.starting_loan) {
      response.total_loan_credit = response.starting_loan;
    }

    // Create the new account
    const newAccount = await AdminCreateLoanAccountModel.create(response);
    console.log(newAccount);

    // Deduct the loan amount from the bank's total amount
    if (response.starting_loan) {
      totalAmountDoc.totalAmount -= parseFloat(response.starting_loan);
    }

    await totalAmountDoc.save();

    // Update the total loan amount for all customers
    let totalLoanAmountDoc = await TotalLoanAmountModel.findOne();

    if (!totalLoanAmountDoc) {
      totalLoanAmountDoc = new TotalLoanAmountModel({ totalLoanAmount: 0 });
    }

    totalLoanAmountDoc.totalLoanAmount += parseFloat(response.starting_loan);
    await totalLoanAmountDoc.save();

    // Record the deposit transaction
    const loanTransaction = new TransactionLoanHistory({
      consumer_name: response.consumer_name,
      account_no: response.account_no,
      transaction_no: response.transaction_no,
      type: 'starting_loan',
      total_loan_credit: response.total_loan_credit,
      date: new Date(),
      address: response.address,
      aadhar_no: response.aadhar_no,
      mobile_no: response.mobile_no,
      mail_id: response.mail_id,
      remarks: 'starting_loan',
      starting_loan: parseFloat(response.starting_loan),
      totalLoanAmount: totalLoanAmountDoc.totalLoanAmount // Ensure this assignment is correct
    });
    
// Log the transaction to verify
    console.log('Loan Transaction:', loanTransaction);
 

    await loanTransaction.save();

    res.status(200).json({ msg: "Admin Create Account Successfully", totalAmount: totalAmountDoc.totalAmount, totalLoanAmount: totalLoanAmountDoc.totalLoanAmount });
  } catch (error) {
    res.status(500).json({ msg: "Admin Account not Created", error: error.message });
  }
};

module.exports = AdminCreateLoanAccount;


//*-------------------*
// Loan Credit Logic //
//*------------------*

const LoanCredit = async (req, res) => {
    try {
      const { account_no, loan_credit, consumer_name,transaction_no } = req.body;
  
      // Find the account
      let account = await AdminCreateLoanAccountModel.findOne({ account_no });
      console.log(account);
  
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
  
      // Initialize total_loan_credit if it's undefined
      if (typeof account.total_loan_credit === 'undefined') {
        account.total_loan_credit = 0;
      }
    
      
  
      // Update the total loan credit
      account.total_loan_credit += parseFloat(loan_credit);
      account.type = 'loan_credit';
  
      // Save the updated account
      await account.save();
  
      // Update the bank's total amount
      let totalAmountDoc = await TotalAmountModel.findOne();
      if (!totalAmountDoc) {
        return res.status(500).json({ message: 'Total amount document not found' });
      }
  
      if (totalAmountDoc.totalAmount < parseFloat(loan_credit)) {
        return res.status(400).json({ message: 'Insufficient balance. You cannot get a loan.' });
      }
  
      totalAmountDoc.totalAmount -= parseFloat(loan_credit);
      await totalAmountDoc.save();
  
      // Record the loan credit transaction
      const loanCreditTransaction = new TransactionLoanHistory({
        consumer_name,
        transaction_no,
        account_no,
        type: 'loan_credit',
        loan_credit: parseFloat(loan_credit),
        date: new Date(),
        remarks: 'loan_credit',
        total_loan_credit: account.total_loan_credit,
      });
      await loanCreditTransaction.save();
  
      res.json({ message: 'Loan credit successful', total_loan_credit: account.total_loan_credit, totalAmount: totalAmountDoc.totalAmount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };




//*--------------------*
// Loan Deposit Logic //
//*--------------------*
  const LoanDeposit = async (req, res) => {
    try {
      const { account_no, loan_deposit, consumer_name, transaction_no } = req.body;
  
      // Find the account
      let account = await AdminCreateLoanAccountModel.findOne({ account_no });
  
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
  
      // Initialize total_loan_credit if it's undefined
      if (typeof account.total_loan_credit === 'undefined') {
        account.total_loan_credit = 0;
      }
  
      // Check if the loan deposit is greater than the total loan credit
      if (account.total_loan_credit < parseFloat(loan_deposit)) {
        return res.status(400).json({ message: 'Loan deposit amount exceeds total loan credit' });
      }
  
      // Update the total loan credit and amount_of_loan_recovery
      account.total_loan_credit -= parseFloat(loan_deposit);
      account.amount_of_loan_recovery = (account.amount_of_loan_recovery || 0) + parseFloat(loan_deposit);
      account.loan_deposit = parseFloat(loan_deposit); // Update the loan_deposit in the account

      // Save the updated account
      await account.save();
  // Update the bank's total amount
  let totalAmountDoc = await TotalAmountModel.findOne();
  if (!totalAmountDoc) {
   totalAmountDoc = new TotalAmountModel({ totalAmount: 0 });
  }
   totalAmountDoc.totalAmount += parseFloat(loan_deposit);
   await totalAmountDoc.save()

      // Update the total loan amount for all customers (RecoveryLoanAmountModel)
      let totalRecoveryLoanAmountDoc = await RecoveryLoanAmountModel.findOne();
  
      if (!totalRecoveryLoanAmountDoc) {
        totalRecoveryLoanAmountDoc = new RecoveryLoanAmountModel({ recoveryLoanAmount: 0 });
      }
  
      totalRecoveryLoanAmountDoc.recoveryLoanAmount += parseFloat(loan_deposit);
      await totalRecoveryLoanAmountDoc.save();
  
      // Calculate remaining loan amount
      let totalLoanAmountDoc = await TotalLoanAmountModel.findOne();
      if (!totalLoanAmountDoc) {
        totalLoanAmountDoc = new TotalLoanAmountModel({ totalLoanAmount: 0 });
      }
  
      let remainingLoanAmount = totalLoanAmountDoc.totalLoanAmount - totalRecoveryLoanAmountDoc.recoveryLoanAmount;
  
      // Save remaining loan amount to RemainingLoanAmountModel
      let remainingLoanAmountDoc = await RemainingLoanAmountModel.findOneAndUpdate(
        {},
        { remainingLoanAmount },
        { new: true, upsert: true }
      );
  
      // Record the loan deposit transaction
      const loanDepositTransaction = new TransactionLoanHistory({
        consumer_name,
        transaction_no,
        account_no,
        type: 'loan_deposit',
        loan_deposit: parseFloat(loan_deposit),
        date: new Date(),
        remarks: 'loan_deposit',
        total_loan_credit: account.total_loan_credit,
        amount_of_loan_recovery: account.amount_of_loan_recovery,
        recoveryLoanAmount: totalRecoveryLoanAmountDoc.recoveryLoanAmount,
        remainingLoanAmount: remainingLoanAmountDoc.remainingLoanAmount // Include remainingLoanAmount in transaction history
      });
  
      await loanDepositTransaction.save();
      console.log(loanDepositTransaction)
  
      res.json({
        message: 'Loan deposit successful',
        loan_deposit: parseFloat(loan_deposit),
        total_loan_credit: account.total_loan_credit,
        amount_of_loan_recovery: account.amount_of_loan_recovery,
        recoveryLoanAmount: totalRecoveryLoanAmountDoc.recoveryLoanAmount,
        remainingLoanAmount: remainingLoanAmountDoc.remainingLoanAmount
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
//*--------------------------------*
// Retrieve All loan Holders Data //
//*-------------------------------*
const GetAllLoanHolders =async(req,res)=>{
  try {
    const users= await AdminCreateLoanAccountModel.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No consumers found" });
    }

    const totalAmountDoc = await TotalAmountModel.findOne();
    const totalAmount = totalAmountDoc ? totalAmountDoc.totalAmount : 0;


    const totalLoanAmountDoc = await TotalLoanAmountModel.findOne();
    const totalLoanAmount = totalLoanAmountDoc ? totalLoanAmountDoc.totalLoanAmount : 0;


    const totalRecoveryLoanAmountDoc = await RecoveryLoanAmountModel.findOne();
    const recoveryLoanAmount = totalRecoveryLoanAmountDoc ? totalRecoveryLoanAmountDoc.recoveryLoanAmount : 0;
    
    const remainingLoanAmountDoc = await RemainingLoanAmountModel.findOne();
    const remainingLoanAmount= remainingLoanAmountDoc ? remainingLoanAmountDoc.remainingLoanAmount: 0;

    res.status(200).json({ users, totalAmount,totalLoanAmount,recoveryLoanAmount,remainingLoanAmount });

  } catch (error) {
    next(error);
  }
}





//*-----------------------------------*
// Retrieve Loan Transaction History //
//*-----------------------------------*
const LoanTransactionhistory = async (req, res) => {
  try {
    const { account_no } = req.params;
    console.log(`Fetching transaction history for account: ${account_no}`); // Log for debugging
    const transactions = await TransactionLoanHistory.find({ account_no });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Fetch account details to get total_bal
    const account = await AdminCreateLoanAccountModel.findOne({ account_no });

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


//*-----------------------------*
// Delete Loan Transaction History  //
//*-----------------------------*
/*const deleteTransactionLoanData = async (req, res, next) => {
  try {
    const id = req.params.id;
    await TransactionLoanHistory.deleteOne({ _id: id });
    return res.status(200).json({ message: "consumer transaction history successfully" });

  } catch (error) {
    next(error)

  }
}*/

/*const LoanMonthlyAudit =async(req,res,next)=>{
  try {
    const users= await TransactionLoanHistory.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No consumers found" });
    }

    const totalAmountDoc = await TotalAmountModel.findOne();
    const totalAmount = totalAmountDoc ? totalAmountDoc.totalAmount : 0;

    res.status(200).json({ users, totalAmount });

  } catch (error) {
    next(error);
  }
}*/



//*---------------------*
// Loan Monthly Audit  //
//*--------------------*
const LoanMonthlyAudit = async (req, res, next) => {
  try {
    const users = await TransactionLoanHistory.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No consumers found" });
    }

    // Calculate total amounts
    const totalAmount = users.reduce((acc, user) => {
      return acc + (user.totalLoanAmount || 0) - (user.recoveryLoanAmount || 0);
    }, 0);

    res.status(200).json({ users, totalAmount });

  } catch (error) {
    next(error);
  }
};


//*----------------------------*
// delete  consumer loan  data     //
//*---------------------------*
const deleteTransactionLoanData = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the account to get its total loan credit
    const account = await AdminCreateLoanAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    if (account.total_loan_credit==0) {
      // Delete the account
      await AdminCreateLoanAccountModel.deleteOne({ _id: id });
      return res.status(200).json({ message: "Consumer deleted successfully" });
    } else {
      return res.status(400).json({ message: "Conditions not met for deletion" });
    }
  } catch (error) {
    next(error);
  }
}



  
module.exports = {AdminCreateLoanAccount,
  LoanCredit,LoanDeposit,GetAllLoanHolders,
  LoanTransactionhistory,
  deleteTransactionLoanData,LoanMonthlyAudit  };
