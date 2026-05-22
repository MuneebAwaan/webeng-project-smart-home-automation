// src/app/api/schedules/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Schedule from "@/models/Schedule";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { updateScheduleSchema } from "@/lib/validations/schemas";
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
      return NextResponse.json({ success: false, error: "Invalid schedule ID" }, { status: 400 });
    }

    await connectDB();
    const schedule = await Schedule.findOne({ _id: id, userId: payload.userId }).populate({
      path: "deviceId",
      select: "name type isOn",
      populate: { path: "roomId", select: "name" },
    });

    if (!schedule) return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error("Get schedule error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid schedule ID" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const validation = updateScheduleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }

    const schedule = await Schedule.findOneAndUpdate(
      { _id: id, userId: payload.userId },
      { ...validation.data },
      { new: true, runValidators: true }
    ).populate({ path: "deviceId", select: "name type isOn", populate: { path: "roomId", select: "name" } });

    if (!schedule) return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Schedule updated successfully", data: schedule });
  } catch (error) {
    console.error("Update schedule error:", error);
    return NextResponse.json({ success: false, error: "Failed to update schedule" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid schedule ID" }, { status: 400 });
    }

    await connectDB();
    const schedule = await Schedule.findOneAndDelete({ _id: id, userId: payload.userId });
    if (!schedule) return NextResponse.json({ success: false, error: "Schedule not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Delete schedule error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete schedule" }, { status: 500 });
  }
}
