// src/app/api/rooms/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import Room from "@/models/Room";
import Device from "@/models/Device";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { createRoomSchema } from "@/lib/validations/schemas";

// GET /api/rooms — fetch all rooms for authenticated user
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const rooms = await Room.find({ userId: payload.userId }).sort({
      createdAt: -1,
    });

    // Attach device counts
    const roomsWithCounts = await Promise.all(
      rooms.map(async (room) => {
        const [deviceCount, activeDeviceCount] = await Promise.all([
          Device.countDocuments({ roomId: room._id }),
          Device.countDocuments({ roomId: room._id, isOn: true }),
        ]);
        return {
          ...room.toObject(),
          deviceCount,
          activeDeviceCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: roomsWithCounts,
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms — create a new room
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();
    const validation = createRoomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, type } = validation.data;

    // Check for duplicate room name per user
    const existing = await Room.findOne({ userId: payload.userId, name });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A room named "${name}" already exists` },
        { status: 409 }
      );
    }

    const room = await Room.create({
      name,
      type,
      userId: payload.userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Room created successfully",
        data: { ...room.toObject(), deviceCount: 0, activeDeviceCount: 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 }
    );
  }
}
