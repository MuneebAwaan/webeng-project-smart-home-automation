// src/app/api/devices/[id]/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Device from "@/models/Device";
import { getUserFromRequest } from "@/lib/middleware/auth";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/devices/[id]/toggle — toggle device on/off
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    // Allow explicit value or just toggle
    const body = await req.json().catch(() => ({}));
    const newState = typeof body.isOn === "boolean" ? body.isOn : !device.isOn;

    device.isOn = newState;
    await device.save();

    return NextResponse.json({
      success: true,
      message: `Device turned ${newState ? "on" : "off"} successfully`,
      data: { _id: device._id, isOn: device.isOn },
    });
  } catch (error) {
    console.error("Toggle device error:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle device" }, { status: 500 });
  }
}
