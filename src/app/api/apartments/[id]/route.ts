import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Apartment from '@/models/Apartment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const apartment = await Apartment.findById(id);
    if (!apartment) {
      return NextResponse.json(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: apartment });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch apartment' },
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
    return NextResponse.json({ success: true, data: apartment });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update apartment' },
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