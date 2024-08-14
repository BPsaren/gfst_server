const user1 = require("../models/user-models");
const mongoose = require("mongoose");
const Transaction = require('../models/transaction-history');
const { AdminCreateAccountModel, TotalAmountModel } = require('../models/transaction-models');


//*------------------------------------*
//  admin using get all user logic   //
//*-----------------------------------*
const getAllUsers = async (req, res, next) => {

  try {

    const users = await user1.find({}, { password: 0 });

    if (!users || users.length === 0) {
      res.status(404), json({ message: "no users found" })
    }
    res.status(200).json(users);

  } catch (error) {

    /// using this logic error  forward backend to frontend
    next(error);
  }
}



//*------------------------------*
// updateUserData  fetch logic   //
//*------------------------------*
const updateUserData = async (req, res, next) => {

  try {
    const id = req.params.id;
    const updateUser = req.body;
    const updateUsers = await user1.updateOne({ _id: id }, { $set: updateUser });


    return res.status(200).json(updateUsers);



  } catch (error) {
    next(error);
  }
}



//*----------------------------*
// single data fetch logic   //
//*---------------------------*
const singleDataById = async (req, res, next) => {
  try {
    const id = req.params.id.trim(); // Retrieve the ID from the request params

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const data = await user1.findOne({ _id: id }, { password: 0 });
    if (!data) {
      console.log("No data found for ID:", id);
      return res.status(404).json({ message: "No data found" });
    }
    console.log("Fetched Data:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


//*----------------------------*
//     Delete user logic        //
//*---------------------------*
const deleteUserById = async (req, res, next) => {


  try {
    const id = req.params.id;
    await user1.deleteOne({ _id: id });
    return res.status(200).json({ message: "user deleted successfully" });

  } catch (error) {
    next(error)

  }
}




//*------------------------------------------*
// Saving Account Data Fetch,Update,Delete //
//*------------------------------------------*
const getAllConsumers = async (req, res, next) => {
  try {
    const users= await AdminCreateAccountModel.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No consumers found" });
    }

    const totalAmountDoc = await TotalAmountModel.findOne();
    const totalAmount = totalAmountDoc ? totalAmountDoc.totalAmount : 0;

    res.status(200).json({ users, totalAmount });

  } catch (error) {
    next(error);
  }
}




//*----------------------------*
// single consumer data fetch  //
//*---------------------------*
const singleConsumerData = async (req, res, next) => {
  try {
    const id = req.params.id;

    const data = await AdminCreateAccountModel.findOne({ _id: id }, { password: 0 });
    return res.status(200).json(data);


  } catch (error) {
    next(error);
  }
}



//*----------------------------*
// update  consumer data fetch  //
//*---------------------------*
/*const updateConsumerData = async (req, res, next) => {

  try {
    const id = req.params.id;
    const updateConsumer = req.body;
    const updateConsumers = await AdminCreateAccountModel.updateOne({ _id: id }, { $set: updateConsumer });
    

    return res.status(200).json(updateConsumers);



  } catch (error) {
    next(error);
  }
}*/

const updateConsumerData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updateConsumer = req.body;

    // Fetch the current account details
    const currentAccount = await AdminCreateAccountModel.findById(id);

    if (!currentAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Calculate the difference in balances
    const openingBalDiff = (updateConsumer.opening_bal || 0) - currentAccount.opening_bal;
    const totalBalDiff = (updateConsumer.total_bal || 0) - currentAccount.total_bal;

    // Update the account details
    const updateConsumers = await AdminCreateAccountModel.updateOne({ _id: id }, { $set: updateConsumer });

    // Update the totalAmount
    const totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      return res.status(500).json({ message: 'TotalAmount document not found' });
    }

    totalAmountDoc.totalAmount += openingBalDiff + totalBalDiff;
    await totalAmountDoc.save();

    return res.status(200).json(updateConsumers);
  } catch (error) {
    next(error);
  }
};

module.exports = { updateConsumerData };


//*----------------------------*
// delete  consumer data     //
//*---------------------------*
/*const deleteConsumerData = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the account to get its total balance
    const account = await AdminCreateAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Consumer not found" });
    }

    const accountTotalBal = account.total_bal;

    // Delete the account
    await AdminCreateAccountModel.deleteOne({ _id: id });

    // Update the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      return res.status(500).json({ message: 'Total amount document not found' });
    }

    if (accountTotalBal) {
      totalAmountDoc.totalAmount -= accountTotalBal;
    }

    await totalAmountDoc.save();

    return res.status(200).json({ message: "Consumer deleted successfully", totalAmount: totalAmountDoc.totalAmount });

  } catch (error) {
    next(error);
  }
};*/

//*----------------------------*
// delete  consumer data     //
//*---------------------------*
const deleteConsumerData = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Find the account to get its total loan credit
    const account = await AdminCreateAccountModel.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Consumer not found" });
    }
    if (account.total_bal==0) {
      // Delete the account
      await AdminCreateAccountModel.deleteOne({ _id: id });
      return res.status(200).json({ message: "Consumer deleted successfully" });
    } else {
      return res.status(400).json({ message: "Conditions not met for deletion" });
    }
  } catch (error) {
    next(error);
  }
}


//*--------------------*
// Deposit Balance   //
//*-------------------*
const Deposit = async (req, res) => {
  try {
    const { account_no, deposit_bal, consumer_name,transaction_no } = req.body;

    // Find the account
    let account = await AdminCreateAccountModel.findOne({ account_no });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Update the total balance based on existing or initial values
    if (account.total_bal == null || account.total_bal === undefined) {
      // Calculate total balance including opening balance and deposit
      account.total_bal = (account.opening_bal || 0) + parseFloat(deposit_bal);
    } else {
      // Update the total balance by adding the deposit amount
      account.total_bal += parseFloat(deposit_bal);
     // account.type='deposit_bal';
    }
      

    // Save the updated account
    await account.save();

    // Update the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      totalAmountDoc = new TotalAmountModel({ totalAmount: 0 });
    }
    totalAmountDoc.totalAmount += parseFloat(deposit_bal);
    await totalAmountDoc.save();

    // Record the deposit transaction
    const depositTransaction = new Transaction({
      consumer_name,
      account_no,
      transaction_no,
      type: 'deposit',
     
      deposit_bal:parseFloat(deposit_bal),
      date: new Date(), // Ensure date is included
      remarks: 'Deposit amount',
      total_bal: account.total_bal, // Correctly use the account's total_bal
    });

    console.log('Deposit Transaction:', depositTransaction); // Log the transaction to verify

    await depositTransaction.save();

    // Return success response with updated total_bal and totalAmount
    res.json({ message: 'Deposit successful', total_bal: account.total_bal, totalAmount: totalAmountDoc.totalAmount });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





//*--------------------*
// Withdraw Balance   //
//*-------------------*
const Withdraw = async (req, res) => {
  try {
    const { account_no, withdraw_bal, consumer_name, transaction_no } = req.body;

    // Find the account
    let account = await AdminCreateAccountModel.findOne({ account_no });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Check if there's enough balance to withdraw
    if (account.total_bal < parseFloat(withdraw_bal)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update the total balance by subtracting the withdraw amount
    account.total_bal -= parseFloat(withdraw_bal);

    // Save the updated account
    account = await account.save();

    // Update the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      return res.status(500).json({ message: 'Total amount document not found' });
    }
    totalAmountDoc.totalAmount -= parseFloat(withdraw_bal);
    await totalAmountDoc.save();

    // Record the withdraw transaction
    const withdrawTransaction = new Transaction({
      consumer_name,
      account_no,
      transaction_no,
      type: 'withdraw',
      withdraw_bal:parseFloat(withdraw_bal),
      date: new Date(),
      remarks: 'Withdrawal amount',
      total_bal: account.total_bal,
    });
    await withdrawTransaction.save();

    res.json({ message: 'Withdrawal successful', total_bal: account.total_bal, totalAmount: totalAmountDoc.totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//*------------------------*
// find single account     //
//*------------------------*
const FindAccount= async (req, res, next) => {
  try {
  // Extract the date parameter from the request
  const { account_no} = req.query;
  // Check if the date parameter is provided
  if (!account_no) {
  return res.status(400).json({ message: "Date parameter is required" });
  }
  // Use the date parameter to filter the meal requests
  const VMR = await AdminCreateAccountModel.find({ account_no });
  if (!VMR || VMR.length === 0) {
  return res.status(404).json({ message: "No Meal Request Found for the given date" });
  }
  res.status(200).json(VMR);
  } catch (error) {
  // Forward the error from backend to frontend
  next(error);
  }
  };
 
  

//*------------------------------------*
//   fetch  the history   transaction //
//*-----------------------------------*
const Transactionhistory = async (req, res) => {
  try {
    const { account_no } = req.params;
    console.log(`Fetching transaction history for account: ${account_no}`); // Log for debugging
    const transactions = await Transaction.find({ account_no });

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    // Fetch account details to get total_bal
    const account = await AdminCreateAccountModel.findOne({ account_no });

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


//*------------------------------*
//  Delete  transaction history //
//*-----------------------------*
const deleteTransactionData = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Transaction.deleteOne({ _id: id });
    return res.status(200).json({ message: "consumer transaction history successfully" });

  } catch (error) {
    next(error)

  }
}


module.exports = {
  getAllUsers,
  deleteUserById,
  singleDataById,
  updateUserData,

  getAllConsumers,
  singleConsumerData,
  updateConsumerData,
  deleteConsumerData,
  Deposit,
  Withdraw,
  FindAccount,
  Transactionhistory,
  deleteTransactionData,
};