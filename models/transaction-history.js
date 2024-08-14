/*const { Schema, model } = require("mongoose");

const transactionSchema = new Schema({
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  total_bal: { type: Number}, 
  remarks: { type: String }
});

const Transaction = model('Transaction', transactionSchema);

module.exports = Transaction;
*/

const { Schema, model } = require("mongoose");

// Counter schema and model for transaction_id
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = model('Counter', CounterSchema);

const TransactionHistorySchema = new Schema({
  transaction_no: { type: String, unique: true },
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'loan', 'opening_bal'] },
//amount: { type: Number, required: true },
  deposit_bal: { type: Number },
  withdraw_bal: { type: Number },
  total_bal: { type: Number },
  date: { type: Date, default: Date.now },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  remarks: { type: String },
  opening_bal: { type: Number },
});

TransactionHistorySchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'transaction_no' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.transaction_no = `GFST${counter.seq}`;
  }
  next();
});

const Transaction = model('TransactionHistory', TransactionHistorySchema);

module.exports = Transaction;
