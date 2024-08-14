/*const { Schema, model } = require("mongoose");

// Counter schema and model for transaction_id
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const CounTeRR = model('CounTeRR', CounterSchema);

const AdminCreateInvestmentAccountSchema = new Schema({
  transaction_no: { type: String, unique: true },
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['investment_of_customers_business','profit_on_customer_investment'] },
  investment_of_customers_business: { type: Number },
  profit_on_customer_investment: { type: Number },
  date: { type: Date, default: Date.now },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  remarks: { type: String },
  individual_total__investment: { type: Number },
  amount_of_investment_recovery: { type: Number }
});

AdminCreateInvestmentAccountSchema.pre('save', async function (next) {
  if (this.isNew) {
    const CounTer = await CounTeRR.findByIdAndUpdate(
      { _id: 'transaction_no' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.transaction_no = `GFST${CounTer.seq}`;
  }
  next();
});

const AdminCreateInvestmentAccountModel = model('AdminCreateInvestmentAccount', AdminCreateInvestmentAccountSchema);

const TotalInvestmentAmountSchema = new Schema({
  totalInvestmentAmount: { type: Number, default: 0 }
});

const TotalInvestmentAmountModel = model('TotalInvestmentAmount', TotalInvestmentAmountSchema);

const TotalRecoveryInvestmentSchema = new Schema({
  recoveryInvestmentTotalAmount: { type: Number, default: 0 }
});

const TotalRecoveryInvestmentSchemaModel = model('TotalRecoveryInvestmentAmount', TotalRecoveryInvestmentSchema);

const RemainingInvestmentSchema = new Schema({
  remainingTotalAmount: { type: Number, default: 0 }
});

const RemainingInvestmentAmountModel = model('RemainingInvestmentAmount', RemainingInvestmentSchema);

module.exports = {
  AdminCreateInvestmentAccountModel,
  CounTeRR,
  TotalInvestmentAmountModel,
  TotalRecoveryInvestmentSchemaModel,
  RemainingInvestmentAmountModel
};
*/

const { Schema, model,connection } = require("mongoose");

// Counter Schema
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 100000 }
});

const CounTeRR = connection.model('CounTeRR', CounterSchema);


const AdminCreateInvestmentAccountSchema = new Schema({
  transaction_no: { type: String, unique: true },
  consumer_name: { type: String },
  account_no: { type: String, required: true },
  type: { type: String, enum: ['investment_of_customers_business','profit_on_customer_investment'] },
  investment_of_customers_business: { type: Number },
  profit_on_customer_investment: { type: Number },
  date: { type: Date, default: Date.now },
  address: { type: String },
  aadhar_no: { type: String },
  mobile_no: { type: String },
  mail_id: { type: String },
  remarks: { type: String },
  individual_total__investment: { type: Number },
  amount_of_investment_recovery: { type: Number }
});


const AdminCreateInvestmentAccountModel = model('AdminCreateInvestmentAccount', AdminCreateInvestmentAccountSchema);

const TotalInvestmentAmountSchema = new Schema({
  totalInvestmentAmount: { type: Number, default: 0 }
});

const TotalInvestmentAmountModel = model('TotalInvestmentAmount', TotalInvestmentAmountSchema);

const TotalRecoveryInvestmentSchema = new Schema({
  recoveryInvestmentTotalAmount: { type: Number, default: 0 }
});

const TotalRecoveryInvestmentSchemaModel = model('TotalRecoveryInvestmentAmount', TotalRecoveryInvestmentSchema);

const RemainingInvestmentSchema = new Schema({
  remainingTotalAmount: { type: Number, default: 0 }
});

const RemainingInvestmentAmountModel = model('RemainingInvestmentAmount', RemainingInvestmentSchema);

module.exports = {
  AdminCreateInvestmentAccountModel,
  CounTeRR,
  TotalInvestmentAmountModel,
  TotalRecoveryInvestmentSchemaModel,
  RemainingInvestmentAmountModel
};

