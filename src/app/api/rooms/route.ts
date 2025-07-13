import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Room from '@/models/Room';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get('apartmentId');
    
    const filter = apartmentId ? { apartmentId } : {};
    const rooms = await Room.find(filter).populate('apartmentId', 'name').sort({ roomNumber: 1 });
    
    return NextResponse.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rooms',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const room = await Room.create(body);
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create room',
      },
      { status: 500 }
    );
  }
}