
const { Schema, model, connection } = require("mongoose");

// Counter Schema
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100000 }
});

const counter = connection.model('counter', CounterSchema);

// AdminCreateAccount Schema
const AdminCreateAccountSchema = new Schema({
  type: { type: String, enum: ['deposit', 'withdraw', 'loan'] },
  date: { type: Date, default: Date.now },

  account_no: { type: String, required: true, unique: true },
  consumer_name: { type: String},
  address: { type: String},
  aadhar_no: { type: String},
  mobile_no: { type: String},
  mail_id: { type: String },
  opening_bal: { type: Number, default: 0 },
  transaction_no: { type: String, unique: true },
  deposit_bal: { type: Number },
  withdraw_bal: { type: Number },
  total_bal: { type: Number },
  loan_Amount: { type: Number },
  remarks: { type: String },
});

const TotalAmountSchema = new Schema({
  totalAmount: { type: Number, default: 0 }
});

const AdminCreateAccountModel = model('AdminCreateAccount', AdminCreateAccountSchema);
const TotalAmountModel = model('TotalAmount', TotalAmountSchema);

module.exports = { AdminCreateAccountModel, TotalAmountModel, counter };
