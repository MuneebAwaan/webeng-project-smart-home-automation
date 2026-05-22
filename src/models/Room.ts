// src/models/Room.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: "bedroom" | "kitchen" | "living_room" | "office" | "bathroom" | "garage" | "basement" | "other";
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [2, "Room name must be at least 2 characters"],
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Room type is required"],
      enum: {
        values: ["bedroom", "kitchen", "living_room", "office", "bathroom", "garage", "basement", "other"],
        message: "{VALUE} is not a valid room type",
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one user can't have two rooms with the same name
RoomSchema.index({ userId: 1, name: 1 }, { unique: true });

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);

export default Room;
