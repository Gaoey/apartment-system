import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bill from '@/models/Bill';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const bill = await Bill.findById(id)
      .populate('apartmentId', 'name address phone')
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