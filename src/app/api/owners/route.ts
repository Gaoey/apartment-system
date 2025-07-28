import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Owner from "@/models/Owner";
import Apartment from "@/models/Apartment";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Apartment;
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");

    let query = Owner.find().sort({ createdAt: -1 });
    
    if (populate === "apartments") {
      query = query.populate("apartments", "name");
    }

    const owners = await query.exec();

    console.log("Owners fetched successfully:", owners.length);
    return NextResponse.json({ success: true, data: owners });
  } catch (error: unknown) {
    console.error("Error fetching owners:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch owners", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    console.log("Received owner data:", JSON.stringify(body, null, 2));
    
    const owner = await Owner.create(body);
    return NextResponse.json({ success: true, data: owner }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating owner:", error);
    
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
    
    // Handle duplicate tax ID error
    if (error && typeof error === 'object' && 'name' in error && error.name === 'MongoServerError' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Owner with this tax ID already exists" },
        { status: 400 }
      );
    }
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create owner",
        details: errorMessage 
      },
      { status: 400 }
    );
  }
}