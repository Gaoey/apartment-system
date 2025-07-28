import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApartment extends Document {
  name: string;
  address: string;
  phone: string;
  taxId: string;
  owners: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Apartment name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, 'Tax ID is required'],
      trim: true,
    },
    owners: [{
      type: Schema.Types.ObjectId,
      ref: 'Owner',
    }],
  },
  {
    timestamps: true,
  }
);

const Apartment: Model<IApartment> = 
  mongoose.models.Apartment || mongoose.model<IApartment>('Apartment', ApartmentSchema);

export default Apartment;