// src/models/Device.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDevice extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: "light" | "fan" | "ac" | "heater" | "chiller" | "tv" | "camera" | "lock" | "thermostat" | "speaker" | "other";
  roomId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  isOn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    name: {
      type: String,
      required: [true, "Device name is required"],
      trim: true,
      minlength: [2, "Device name must be at least 2 characters"],
      maxlength: [50, "Device name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Device type is required"],
      enum: {
        values: ["light", "fan", "ac", "heater", "chiller", "tv", "camera", "lock", "thermostat", "speaker", "other"],
        message: "{VALUE} is not a valid device type",
      },
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isOn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

DeviceSchema.index({ userId: 1, roomId: 1 });
DeviceSchema.index({ userId: 1, isOn: 1 });

const Device: Model<IDevice> =
  mongoose.models.Device || mongoose.model<IDevice>("Device", DeviceSchema);

export default Device;
