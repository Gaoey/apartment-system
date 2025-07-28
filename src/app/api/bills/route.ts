import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Room from "@/models/Room";
import Apartment from "@/models/Apartment";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Room;
    void Apartment;
    
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get("apartmentId");
    const roomId = searchParams.get("roomId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: Record<string, string | { $gte: Date; $lte: Date }> = {};
    if (apartmentId) query.apartmentId = apartmentId;
    if (roomId) query.roomId = roomId;
    
    // Add month/year filtering
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      query.billingDate = {
        $gte: startDate,
        $lte: endDate
      };
    }

    console.log("Fetching bills with query:", query);

    // Get total count for pagination
    const totalBills = await Bill.countDocuments(query);
    const totalPages = Math.ceil(totalBills / limit);
    const skip = (page - 1) * limit;

    const bills = await Bill.find(query)
      .populate("apartmentId", "name")
      .populate("roomId", "roomNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log("Bills fetched successfully:", bills.length, "of", totalBills);
    
    return NextResponse.json({ 
      success: true, 
      data: bills,
      pagination: {
        currentPage: page,
        totalPages,
        totalBills,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching bills:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch bills", details: errorMessage },
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
