// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Room from "@/models/Room";
import Device from "@/models/Device";
import Schedule from "@/models/Schedule";
import { getUserFromRequest } from "@/lib/middleware/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });

    await connectDB();

    const userId = payload.userId;

    const [totalRooms, totalDevices, activeDevices, totalSchedules, activeSchedules, recentDevices] =
      await Promise.all([
        Room.countDocuments({ userId }),
        Device.countDocuments({ userId }),
        Device.countDocuments({ userId, isOn: true }),
        Schedule.countDocuments({ userId }),
        Schedule.countDocuments({ userId, isActive: true }),
        Device.find({ userId })
          .sort({ updatedAt: -1 })
          .limit(5)
          .populate("roomId", "name"),
      ]);

    const recentActivity = recentDevices.map((device) => ({
      id: device._id.toString(),
      action: device.isOn ? "Turned On" : "Turned Off",
      deviceName: device.name,
      roomName: (device.roomId as unknown as { name: string })?.name ?? "Unknown",
      timestamp: device.updatedAt.toISOString(),
      type: device.isOn ? "on" : "off",
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        totalDevices,
        activeDevices,
        totalSchedules,
        activeSchedules,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
