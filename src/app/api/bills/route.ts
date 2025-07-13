import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get('apartmentId');
    const roomId = searchParams.get('roomId');
    
    let query: any = {};
    if (apartmentId) query.apartmentId = apartmentId;
    if (roomId) query.roomId = roomId;
    
    const bills = await Bill.find(query)
      .populate('apartmentId', 'name')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const bill = await Bill.create(body);
    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create bill' },
      { status: 400 }
    );
  }
}