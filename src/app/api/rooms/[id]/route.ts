// src/app/api/rooms/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Room from "@/models/Room";
import Device from "@/models/Device";
import Schedule from "@/models/Schedule";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { updateRoomSchema } from "@/lib/validations/schemas";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/rooms/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid room ID" }, { status: 400 });
    }

    await connectDB();
    const room = await Room.findOne({ _id: id, userId: payload.userId });
    if (!room) return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });

    const [deviceCount, activeDeviceCount] = await Promise.all([
      Device.countDocuments({ roomId: id }),
      Device.countDocuments({ roomId: id, isOn: true }),
    ]);

    return NextResponse.json({ success: true, data: { ...room.toObject(), deviceCount, activeDeviceCount } });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch room" }, { status: 500 });
  }
}

// PUT /api/rooms/[id]
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid room ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const validation = updateRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    const room = await Room.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      { ...validation.data },
      { new: true, runValidators: true }
    );

    if (!room) return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Room updated successfully", data: room });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json({ success: false, error: "Failed to update room" }, { status: 500 });
  }
}

// DELETE /api/rooms/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid room ID" }, { status: 400 });
    }

    await connectDB();

    const room = await Room.findOne({ _id: id, userId: payload.userId });
    if (!room) return NextResponse.json({ success: false, error: "Room not found" }, { status: 404 });

    // Cascade delete: remove all devices and their schedules
    const devices = await Device.find({ roomId: id });
    const deviceIds = devices.map((d) => d._id);
    await Schedule.deleteMany({ deviceId: { $in: deviceIds } });
    await Device.deleteMany({ roomId: id });
    await Room.deleteOne({ _id: id });

    return NextResponse.json({ success: true, message: "Room and all its devices deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete room" }, { status: 500 });
  }
}
