import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Apartment from '@/models/Apartment';

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
    const apartment = await Apartment.create(body);
    return NextResponse.json({ success: true, data: apartment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to create apartment' },
      { status: 400 }
    );
  }
}