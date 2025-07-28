import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Apartment from '@/models/Apartment';
import Owner from '@/models/Owner';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Owner;
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const populate = searchParams.get("populate");
    
    let query = Apartment.findById(id);
    
    if (populate === "owners") {
      query = query.populate("owners", "name");
    }
    
    const apartment = await query.exec();
    
    if (!apartment) {
      return NextResponse.json(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: apartment });
  } catch (error: unknown) {
    console.error('Error fetching apartment:', error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch apartment', details: errorMessage },
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
    const { id } = await params;
    const body = await request.json();
    
    console.log('UPDATE apartment:', id, JSON.stringify(body, null, 2));
    
    // Get the old apartment to manage owner relationships
    const oldApartment = await Apartment.findById(id);
    if (!oldApartment) {
      return NextResponse.json(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }
    
    // Update the apartment
    const apartment = await Apartment.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!apartment) {
      return NextResponse.json(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }
    
    // Update owner relationships if owners were provided
    if (body.owners && Array.isArray(body.owners)) {
      const oldOwnerIds = (oldApartment.owners || []).map((id: string | object) => id.toString());
      const newOwnerIds = body.owners;
      
      // Remove apartment from old owners that are no longer associated
      const ownersToRemove = oldOwnerIds.filter((ownerId: string) => !newOwnerIds.includes(ownerId));
      if (ownersToRemove.length > 0) {
        await Owner.updateMany(
          { _id: { $in: ownersToRemove } },
          { $pull: { apartments: id } }
        );
      }
      
      // Add apartment to new owners
      const ownersToAdd = newOwnerIds.filter((ownerId: string) => !oldOwnerIds.includes(ownerId));
      if (ownersToAdd.length > 0) {
        await Owner.updateMany(
          { _id: { $in: ownersToAdd } },
          { $addToSet: { apartments: id } }
        );
      }
    }
    
    return NextResponse.json({ success: true, data: apartment });
  } catch (error: unknown) {
    console.error('Error updating apartment:', error);
    
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
        error: 'Failed to update apartment',
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
    const apartment = await Apartment.findByIdAndDelete(id);
    if (!apartment) {
      return NextResponse.json(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete apartment' },
      { status: 500 }
    );
  }
}