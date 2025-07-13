import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';
import Room from '@/models/Room';
import Apartment from '@/models/Apartment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Room;
    void Apartment;
    
    const { id } = await params;
    
    const bill = await Bill.findById(id)
      .populate('apartmentId', 'name address phone taxId')
      .populate('roomId', 'roomNumber');
    
    if (!bill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bill not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bill',
      },
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
    
    // Ensure models are registered
    void Room;
    void Apartment;
    
    const { id } = await params;
    const body = await request.json();
    
    console.log('Updating bill:', id, body);
    
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
      .populate('apartmentId', 'name address phone taxId')
      .populate('roomId', 'roomNumber');
    
    if (!updatedBill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bill not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedBill,
    });
  } catch (error: unknown) {
    console.error('Error updating bill:', error);
    
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
        error: 'Failed to update bill',
        details: errorMessage
      },
      { status: 500 }
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
    
    console.log('Deleting bill:', id);
    
    const deletedBill = await Bill.findByIdAndDelete(id);
    
    if (!deletedBill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bill not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Bill deleted successfully',
      data: deletedBill,
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete bill',
      },
      { status: 500 }
    );
  }
}