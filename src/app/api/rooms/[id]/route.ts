import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const room = await Room.findById(params.id).populate('apartmentId', 'name');
    
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch room',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const room = await Room.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update room',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const room = await Room.findByIdAndDelete(params.id);
    
    if (!room) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete room',
      },
      { status: 500 }
    );
  }
}