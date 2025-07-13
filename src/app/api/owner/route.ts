import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Owner from '@/models/Owner';

export async function GET() {
  try {
    await dbConnect();
    
    const owner = await Owner.findOne().sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    console.error('Error fetching owner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch owner information',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const existingOwner = await Owner.findOne();
    
    let owner;
    if (existingOwner) {
      owner = await Owner.findByIdAndUpdate(existingOwner._id, body, { new: true });
    } else {
      owner = await Owner.create(body);
    }
    
    return NextResponse.json({
      success: true,
      data: owner,
    });
  } catch (error) {
    console.error('Error saving owner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save owner information',
      },
      { status: 500 }
    );
  }
}