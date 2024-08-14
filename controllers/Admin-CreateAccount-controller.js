
const Transaction = require('../models/transaction-history');
const { AdminCreateAccountModel, TotalAmountModel, counter } = require('../models/transaction-models');


//*--------------------------------------------------------*
// Generate the Transaction id and Unique Account Number  //
//*--------------------------------------------------------*
const getNextSequence = async (name) => {
  const result = await counter.findByIdAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
};



//*------------------------------------*
// Admin Saving Account Create Logic  //
//*-----------------------------------*
const AdminCreateAccount = async (req, res) => {
  try {
    const response = req.body;
    console.log('Request Body:', response);

    // Get the next account number
    //const nextAccountNumber = await getNextSequence('account_no');
    //response.account_no = nextAccountNumber.toString();

    //Get the next account number
    const nextAccountNumber = await getNextSequence('account_no');
    response.account_no = (100000 + nextAccountNumber).toString();
    // Get the next transaction ID
    const nextTransactionId = await getNextSequence('transaction_no');
    response.transaction_no = `GFST${nextTransactionId}`;
    console.log('Request Body:', response);

    // Set total_bal to opening_bal if opening_bal is provided
    if (response.opening_bal) {
      response.total_bal = parseFloat(response.opening_bal);
    }
    // Create the new account
    const newAccount = await AdminCreateAccountModel.create(response);

    // Update the bank's total amount
    let totalAmountDoc = await TotalAmountModel.findOne();
    if (!totalAmountDoc) {
      totalAmountDoc = new TotalAmountModel({ totalAmount: 0 });
    }

    if (response.opening_bal) {
      totalAmountDoc.totalAmount += parseFloat(response.opening_bal);
    }

    await totalAmountDoc.save();

    // Record the deposit transaction
    const depositTransaction = new Transaction({
      consumer_name: response.consumer_name,
      account_no: response.account_no,
      transaction_no:response.transaction_no,
      type: 'opening_bal',
      amount: parseFloat(response.opening_bal),
      date: new Date(), // Ensure date is included
      address:response.address,
      aadhar_no:response.aadhar_no,
      mobile_no:response.mobile_no, 
      mail_id:response.mail_id,
      remarks: 'Opening Balance',
      total_bal:response.total_bal,
      opening_bal: parseFloat(response.opening_bal), // Correctly use the account's opening balance
    });

    console.log('Deposit Transaction:', depositTransaction); // Log the transaction to verify

    await depositTransaction.save();

    res.status(200).json({ msg: "Admin Create Account Successfully", totalAmount: totalAmountDoc.totalAmount });
  } catch (error) {
    res.status(500).json({ msg: "Admin Account not Created", error: error.message });
  }
};

module.exports = AdminCreateAccount;

