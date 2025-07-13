import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bill from "@/models/Bill";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get("apartmentId");
    const roomId = searchParams.get("roomId");

    const query: Record<string, string> = {};
    if (apartmentId) query.apartmentId = apartmentId;
    if (roomId) query.roomId = roomId;

    const bills = await Bill.find(query)
      .populate("apartmentId", "name")
      .populate("roomId", "roomNumber")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bills });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    console.log("Received bill data:", JSON.stringify(body, null, 2));
    
    const bill = await Bill.create(body);
    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating bill:", error);
    
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      if ('errors' in error && error.errors && typeof error.errors === 'object') {
        for (const field in error.errors) {
          const fieldError = (error.errors as Record<string, { message: string }>)[field];
          if (fieldError && typeof fieldError === 'object' && 'message' in fieldError) {
            validationErrors[field] = fieldError.message;
          }
        }
      }
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed", 
          validationErrors 
        },
        { status: 400 }
      );
    }
    
    // Handle other mongoose errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'MongoServerError' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Duplicate entry found" },
        { status: 400 }
      );
    }
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create bill",
        details: errorMessage 
      },
      { status: 400 }
    );
  }
}
