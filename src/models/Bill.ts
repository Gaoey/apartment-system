import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBill extends Document {
  apartmentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  billingDate: Date;
  paymentDueDate: Date;
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  tenantTaxId: string;
  rentalPeriod: {
    from: Date;
    to: Date;
  };
  rent: number;
  discount: number;
  electricity: {
    startMeter: number;
    endMeter: number;
    rate: number;
    meterFee: number;
  };
  water: {
    startMeter: number;
    endMeter: number;
    rate: number;
    meterFee: number;
  };
  airconFee: number;
  fridgeFee: number;
  otherFees: Array<{
    description: string;
    amount: number;
  }>;
  netRent: number;
  electricityCost: number;
  waterCost: number;
  grandTotal: number;
  documentNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: [true, 'Apartment ID is required'],
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    billingDate: {
      type: Date,
      required: [true, 'Billing date is required'],
    },
    paymentDueDate: {
      type: Date,
      required: [true, 'Payment due date is required'],
    },
    tenantName: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
    },
    tenantAddress: {
      type: String,
      required: [true, 'Tenant address is required'],
      trim: true,
    },
    tenantPhone: {
      type: String,
      required: [true, 'Tenant phone is required'],
      trim: true,
    },
    tenantTaxId: {
      type: String,
      required: [true, 'Tenant tax ID is required'],
      trim: true,
    },
    rentalPeriod: {
      from: {
        type: Date,
        required: [true, 'Rental period from date is required'],
      },
      to: {
        type: Date,
        required: [true, 'Rental period to date is required'],
      },
    },
    rent: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    electricity: {
      startMeter: {
        type: Number,
        required: [true, 'Electricity start meter is required'],
        min: 0,
      },
      endMeter: {
        type: Number,
        required: [true, 'Electricity end meter is required'],
        min: 0,
      },
      rate: {
        type: Number,
        required: [true, 'Electricity rate is required'],
        min: 0,
      },
      meterFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    water: {
      startMeter: {
        type: Number,
        required: [true, 'Water start meter is required'],
        min: 0,
      },
      endMeter: {
        type: Number,
        required: [true, 'Water end meter is required'],
        min: 0,
      },
      rate: {
        type: Number,
        required: [true, 'Water rate is required'],
        min: 0,
      },
      meterFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    airconFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    fridgeFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherFees: [{
      description: {
        type: String,
        required: [true, 'Other fee description is required'],
        trim: true,
      },
      amount: {
        type: Number,
        required: [true, 'Other fee amount is required'],
        min: 0,
      },
    }],
    netRent: {
      type: Number,
      default: 0,
    },
    electricityCost: {
      type: Number,
      default: 0,
    },
    waterCost: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    documentNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

BillSchema.pre('save', function (this: IBill, next) {
  this.netRent = this.rent - this.discount;
  this.electricityCost = (this.electricity.endMeter - this.electricity.startMeter) * this.electricity.rate + this.electricity.meterFee;
  this.waterCost = (this.water.endMeter - this.water.startMeter) * this.water.rate + this.water.meterFee;
  const otherFeesTotal = this.otherFees.reduce((sum, fee) => sum + fee.amount, 0);
  this.grandTotal = this.netRent + this.electricityCost + this.waterCost + this.airconFee + this.fridgeFee + otherFeesTotal;
  next();
});

const Bill: Model<IBill> = 
  mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);

export default Bill;