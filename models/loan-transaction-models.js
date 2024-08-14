const { Schema, model, connection } = require("mongoose");

// Counter Schema
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100000 }
});

const CounTer = connection.model('CounTer', CounterSchema);

// AdminCreateAccount Schema
const AdminCreateLoanAccountSchema = new Schema({
  type: { type: String, enum: ['loan_credit', 'loan_deposit'] },
  date: { type: Date, default: Date.now },

  account_no: { type: String, required: true, unique: true },
  consumer_name: { type: String },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  starting_loan: { type: Number, default: 0 },
  transaction_no: { type: String, unique: true },
  loan_credit: { type: Number },
  loan_deposit: { type: Number },
  total_loan_credit: { type: Number },
  amount_of_loan_recovery: { type:Number },
  
  remarks: { type: String },
});

const TotalLoanAmountSchema = new Schema({
  totalLoanAmount: { type: Number, default: 0 }
});

const TotalRecoveryLoanSchema = new Schema({
  recoveryLoanAmount: { type: Number, default: 0 }
});


const RemainingLoanSchema = new Schema({
  remainingLoanAmount: { type: Number, default: 0 }
});




const AdminCreateLoanAccountModel = model('AdminCreateLoanAccount', AdminCreateLoanAccountSchema);
const TotalLoanAmountModel = model('TotalLoanAmount', TotalLoanAmountSchema);
const RecoveryLoanAmountModel = model('RecoveryLoanAmount', TotalRecoveryLoanSchema);
const RemainingLoanAmountModel = model('RemainingLoanAmount', RemainingLoanSchema);

module.exports = { AdminCreateLoanAccountModel, CounTer, TotalLoanAmountModel,RecoveryLoanAmountModel,RemainingLoanAmountModel };
