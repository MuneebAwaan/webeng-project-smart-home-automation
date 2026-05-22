// src/app/api/devices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Device from "@/models/Device";
import Room from "@/models/Room";
import Schedule from "@/models/Schedule";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { updateDeviceSchema } from "@/lib/validations/schemas";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid device ID" }, { status: 400 });
    }

    await connectDB();
    const device = await Device.findOne({ _id: id, userId: payload.userId }).populate("roomId", "name type");
    if (!device) return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });

    const scheduleCount = await Schedule.countDocuments({ deviceId: id });

    return NextResponse.json({ success: true, data: { ...device.toObject(), scheduleCount } });
  } catch (error) {
    console.error("Get device error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch device" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid device ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const validation = updateDeviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    // If roomId is changing, verify new room belongs to user
    if (validation.data.roomId) {
      const room = await Room.findOne({ _id: validation.data.roomId, userId: payload.userId });
      if (!room) return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });
    }

    const device = await Device.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      { ...validation.data },
      { new: true, runValidators: true }
    ).populate("roomId", "name type");

    if (!device) return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Device updated successfully", data: device });
  } catch (error) {
    console.error("Update device error:", error);
    return NextResponse.json({ success: false, error: "Failed to update device" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid device ID" }, { status: 400 });
    }

    await connectDB();
    const device = await Device.findOne({ _id: id, userId: payload.userId });
    if (!device) return NextResponse.json({ success: false, error: "Device not found" }, { status: 404 });

    // Cascade delete schedules for this device
    await Schedule.deleteMany({ deviceId: id });
    await Device.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Device and its schedules deleted successfully" });
  } catch (error) {
    console.error("Delete device error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete device" }, { status: 500 });
  }
}
