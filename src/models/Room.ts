import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  apartmentId: mongoose.Types.ObjectId;
  roomNumber: string;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  rentalStartDate?: Date;
  monthlyRent?: number;
  securityDeposit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    apartmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: [true, 'Apartment ID is required'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    tenantName: {
      type: String,
      trim: true,
    },
    tenantPhone: {
      type: String,
      trim: true,
    },
    tenantEmail: {
      type: String,
      trim: true,
    },
    rentalStartDate: {
      type: Date,
    },
    monthlyRent: {
      type: Number,
      min: 0,
    },
    securityDeposit: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Room: Model<IRoom> = 
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;