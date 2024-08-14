

const { Schema, model } = require("mongoose");

// Counter schema and model for transaction_id
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CounTeR = model('CounTeR', CounterSchema);

const TransactionLoanSchema = new Schema({
  transaction_no: { type: String, unique: true },
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['loan_credit', 'loan_deposit', 'starting_loan'] },
//amount: { type: Number, required: true },
  loan_credit: { type: Number },
  loan_deposit: { type: Number },
  total_loan_credit: { type: Number},
  amount_of_loan_recovery: { type:Number },
  recoveryLoanAmount:{type: Number},
  totalLoanAmount: { type: Number},
  //remaining_total_loan:{type: Number},
  remainingLoanAmount:{type: Number},
  date: { type: Date, default: Date.now },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  remarks: { type: String },
  starting_loan: { type: Number },
});

TransactionLoanSchema.pre('save', async function (next) {
  if (this.isNew) {
    const CounTer = await CounTeR.findByIdAndUpdate(
      { _id: 'transaction_no' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.transaction_no = `GFST${CounTer.seq}`;
  }
  next();
});

const TransactionLoanHistory = model('TransactionLoanHistory', TransactionLoanSchema);

module.exports = TransactionLoanHistory;
