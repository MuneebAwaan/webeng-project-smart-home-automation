// src/app/api/schedules/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Schedule from "@/models/Schedule";
import Device from "@/models/Device";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { createScheduleSchema } from "@/lib/validations/schemas";

// GET /api/schedules
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");

    const query: Record<string, unknown> = { userId: payload.userId };
    if (deviceId) query.deviceId = deviceId;

    const schedules = await Schedule.find(query)
      .populate({ path: "deviceId", select: "name type isOn", populate: { path: "roomId", select: "name" } })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    console.error("Get schedules error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// POST /api/schedules
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    await connectDB();

    const body = await req.json();
    const validation = createScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    const { deviceId, action, startTime, endTime, frequency, daysOfWeek, isActive } = validation.data;

    // Verify device belongs to user
    const device = await Device.findOne({ _id: deviceId, userId: payload.userId });
    if (!device) return NextResponse.json({ success: false, error: "Device not found or access denied" }, { status: 404 });

    // Check for conflicting schedules on same device at same time
    const conflict = await Schedule.findOne({
      deviceId,
      startTime,
      action,
      isActive: true,
      frequency,
    });
    if (conflict) {
      return NextResponse.json(
        { success: false, error: "A schedule with the same time and action already exists for this device" },
        { status: 409 }
      );
    }

    const schedule = await Schedule.create({
      deviceId,
      userId: payload.userId,
      action,
      startTime,
      endTime,
      frequency,
      daysOfWeek: daysOfWeek ?? [],
      isActive: isActive ?? true,
    });

    await schedule.populate({
      path: "deviceId",
      select: "name type isOn",
      populate: { path: "roomId", select: "name" },
    });

    return NextResponse.json(
      { success: true, message: "Schedule created successfully", data: schedule },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json({ success: false, error: "Failed to create schedule" }, { status: 500 });
  }
}
