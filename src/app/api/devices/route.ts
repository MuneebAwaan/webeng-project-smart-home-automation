// src/app/api/devices/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Device from "@/models/Device";
import Room from "@/models/Room";
import Schedule from "@/models/Schedule";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { createDeviceSchema } from "@/lib/validations/schemas";
import mongoose from "mongoose";

// GET /api/devices — get all devices, optionally filter by roomId
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    const query: Record<string, unknown> = { userId: payload.userId };
    if (roomId) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return NextResponse.json({ success: false, error: "Invalid room ID" }, { status: 400 });
      }
      query.roomId = roomId;
    }

    const devices = await Device.find(query)
      .populate("roomId", "name type")
      .sort({ createdAt: -1 });

    const devicesWithCounts = await Promise.all(
      devices.map(async (device) => {
        const scheduleCount = await Schedule.countDocuments({ deviceId: device._id });
        return { ...device.toObject(), scheduleCount };
      })
    );

    return NextResponse.json({ success: true, data: devicesWithCounts });
  } catch (error) {
    console.error("Get devices error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch devices" }, { status: 500 });
  }
}

// POST /api/devices — create a device
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const validation = createDeviceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, type, roomId, isOn } = validation.data;

    // Verify room belongs to the user
    const room = await Room.findOne({ _id: roomId, userId: payload.userId });
    if (!room) {
      return NextResponse.json({ success: false, error: "Room not found or access denied" }, { status: 404 });
    }

    const device = await Device.create({
      name,
      type,
      roomId,
      userId: payload.userId,
      isOn: isOn ?? false,
    });

    await device.populate("roomId", "name type");

    return NextResponse.json(
      { success: true, message: "Device added successfully", data: { ...device.toObject(), scheduleCount: 0 } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create device error:", error);
    return NextResponse.json({ success: false, error: "Failed to create device" }, { status: 500 });
  }
}
