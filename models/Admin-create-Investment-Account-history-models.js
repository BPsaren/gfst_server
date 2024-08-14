const { Schema, model } = require("mongoose");

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CounTAR = model('CounTAR', CounterSchema);

const TransactionInvestmentAccountSchema = new Schema({
  transaction_no: { type: String, unique: true },
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['investment_of_customers_business', 'profit_on_customer_investment'] },
  investment_of_customers_business: { type: Number },
  profit_on_customer_investment: { type: Number },
  date: { type: Date, default: Date.now },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  remarks: { type: String },
  totalInvestmentAmount: { type: Number },
  recoveryInvestmentTotalAmount: { type: Number },
  remainingLoanAmount: { type: Number },
  individual_total__investment: { type: Number },
  amount_of_investment_recovery: { type: Number }
});


TransactionInvestmentAccountSchema.pre('save', async function (next) {
  if (this.isNew) {
    const CounTer = await CounTAR.findByIdAndUpdate(
      { _id: 'transaction_no' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.transaction_no = `GFSTH${CounTer.seq}`;
  }
  next();
});

const TransactionInvestmentAccountHistory = model('TransactionInvestmentAccountHistory', TransactionInvestmentAccountSchema);

module.exports = { TransactionInvestmentAccountHistory };
