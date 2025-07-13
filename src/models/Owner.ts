import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOwner extends Document {
  name: string;
  address: string;
  phone: string;
  taxId: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Owner address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Owner phone is required'],
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, 'Owner tax ID is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Owner: Model<IOwner> = 
  mongoose.models.Owner || mongoose.model<IOwner>('Owner', OwnerSchema);

export default Owner;