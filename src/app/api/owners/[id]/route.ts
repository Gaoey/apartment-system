import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Owner from "@/models/Owner";
import Apartment from "@/models/Apartment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Apartment;
    
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");
    
    const { id } = await params;
    let query = Owner.findById(id);
    
    if (populate === "apartments") {
      query = query.populate("apartments", "name");
    }
    
    const owner = await query.exec();
    
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: owner });
  } catch (error: unknown) {
    console.error("Error fetching owner:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch owner", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { id } = await params;
    console.log("UPDATE owner:", id, JSON.stringify(body, null, 2));
    
    const owner = await Owner.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: owner });
  } catch (error: unknown) {
    console.error("Error updating owner:", error);
    
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
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update owner",
        details: errorMessage 
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Check if owner is associated with any apartments
    const apartments = await Apartment.find({ owners: id });
    if (apartments.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete owner. Owner is associated with apartments.",
          details: `Owner is associated with ${apartments.length} apartment(s). Please remove the owner from all apartments first.`
        },
        { status: 400 }
      );
    }
    
    const owner = await Owner.findByIdAndDelete(id);
    
    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Owner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: owner });
  } catch (error: unknown) {
    console.error("Error deleting owner:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete owner",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}