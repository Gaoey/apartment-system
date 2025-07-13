import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBill extends Document {
  apartmentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  billingDate: Date;
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
  otherFees: number;
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
    otherFees: {
      type: Number,
      default: 0,
      min: 0,
    },
    netRent: {
      type: Number,
      required: true,
    },
    electricityCost: {
      type: Number,
      required: true,
    },
    waterCost: {
      type: Number,
      required: true,
    },
    grandTotal: {
      type: Number,
      required: true,
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

BillSchema.pre('save', function (next) {
  this.netRent = this.rent - this.discount;
  this.electricityCost = (this.electricity.endMeter - this.electricity.startMeter) * this.electricity.rate + this.electricity.meterFee;
  this.waterCost = (this.water.endMeter - this.water.startMeter) * this.water.rate + this.water.meterFee;
  this.grandTotal = this.netRent + this.electricityCost + this.waterCost + this.airconFee + this.fridgeFee + this.otherFees;
  next();
});

const Bill: Model<IBill> = 
  mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);

export default Bill;