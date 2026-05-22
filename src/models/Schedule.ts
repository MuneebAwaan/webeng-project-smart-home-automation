// src/models/Schedule.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  deviceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: "on" | "off";
  startTime: string;
  endTime?: string;
  frequency: "once" | "daily" | "weekly";
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: [true, "Device is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: {
        values: ["on", "off"],
        message: "Action must be either on or off",
      },
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^\d{2}:\d{2}$/, "Start time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      match: [/^\d{2}:\d{2}$/, "End time must be in HH:MM format"],
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: {
        values: ["once", "daily", "weekly"],
        message: "{VALUE} is not a valid frequency",
      },
      default: "daily",
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (days: number[]) => days.every((d) => d >= 0 && d <= 6),
        message: "Days of week must be between 0 (Sunday) and 6 (Saturday)",
      },
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ScheduleSchema.index({ userId: 1, deviceId: 1 });
ScheduleSchema.index({ userId: 1, isActive: 1 });

const Schedule: Model<ISchedule> =
  mongoose.models.Schedule ||
  mongoose.model<ISchedule>("Schedule", ScheduleSchema);

export default Schedule;
