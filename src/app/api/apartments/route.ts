import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Apartment from '@/models/Apartment';
import Owner from '@/models/Owner';

export async function GET() {
  try {
    await dbConnect();
    const apartments = await Apartment.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: apartments });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    console.log('CREATE apartment:', JSON.stringify(body, null, 2));
    
    const apartment = await Apartment.create(body);
    
    // Update owner relationships if owners were provided
    if (body.owners && Array.isArray(body.owners) && body.owners.length > 0) {
      await Owner.updateMany(
        { _id: { $in: body.owners } },
        { $addToSet: { apartments: apartment._id } }
      );
    }
    
    return NextResponse.json({ success: true, data: apartment }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating apartment:', error);
    
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
        error: 'Failed to create apartment',
        details: errorMessage 
      },
      { status: 400 }
    );
  }
}