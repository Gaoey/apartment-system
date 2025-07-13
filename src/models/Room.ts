import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
  apartmentId: mongoose.Types.ObjectId;
  roomNumber: string;
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
  },
  {
    timestamps: true,
  }
);

const Room: Model<IRoom> = 
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;