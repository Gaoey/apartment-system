import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bill, { IBill } from "@/models/Bill";
import Room from "@/models/Room";
import Apartment from "@/models/Apartment";
import { IRoom } from "@/models/Room";
import { IApartment } from "@/models/Apartment";

// Type for populated bill
interface PopulatedBill extends Omit<IBill, 'roomId' | 'apartmentId'> {
  roomId: IRoom;
  apartmentId: IApartment;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Room;
    void Apartment;
    
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID parameter is required" },
        { status: 400 }
      );
    }

    console.log("Fetching latest room data for roomId:", roomId);

    // Find the most recent bill for this room
    const latestBill = await Bill.findOne({
      roomId: roomId
    })
      .populate("apartmentId", "name")
      .populate("roomId", "roomNumber")
      .sort({ billingDate: -1, createdAt: -1 }) as unknown as PopulatedBill;

    if (!latestBill) {
      // No previous bills found for this room
      return NextResponse.json({ 
        success: true, 
        data: {
          hasData: false,
          message: "No previous bills found for this room"
        }
      });
    }

    // Use tenant info from the latest bill (no automatic updates to preserve history)
    const tenantInfoSource = latestBill;

    const responseData = {
      hasData: true,
      roomId: latestBill.roomId._id,
      roomNumber: latestBill.roomId.roomNumber,
      apartmentId: latestBill.apartmentId._id,
      apartmentName: latestBill.apartmentId.name,
      
      // Tenant information (from most recent bill in current month or latest bill)
      tenantInfo: {
        tenantName: tenantInfoSource.tenantName,
        tenantAddress: tenantInfoSource.tenantAddress,
        tenantPhone: tenantInfoSource.tenantPhone,
        tenantTaxId: tenantInfoSource.tenantTaxId,
        lastUpdated: tenantInfoSource.billingDate
      },
      
      // Meter readings (from latest bill to use as starting points)
      meterReadings: {
        electricity: {
          endMeter: latestBill.electricity.endMeter,
          rate: latestBill.electricity.rate,
          meterFee: latestBill.electricity.meterFee
        },
        water: {
          endMeter: latestBill.water.endMeter,
          rate: latestBill.water.rate,
          meterFee: latestBill.water.meterFee
        }
      },
      
      // Additional fees that might be recurring
      recurringFees: {
        rent: latestBill.rent,
        discounts: latestBill.discounts || [],
        airconFee: latestBill.airconFee,
        fridgeFee: latestBill.fridgeFee
      },
      
      // Metadata
      lastBillDate: latestBill.billingDate,
      lastBillId: latestBill._id
    };

    console.log("Latest room data fetched successfully");
    
    return NextResponse.json({ 
      success: true, 
      data: responseData
    });
  } catch (error: unknown) {
    console.error("Error fetching latest room data:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch latest room data", details: errorMessage },
      { status: 500 }
    );
  }
}
