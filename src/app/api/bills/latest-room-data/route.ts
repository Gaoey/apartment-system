import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Room from "@/models/Room";
import Apartment from "@/models/Apartment";

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
      .sort({ billingDate: -1, createdAt: -1 });

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

    // Get all bills for this room in the current month to check for tenant info updates
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const currentMonthBills = await Bill.find({
      roomId: roomId,
      billingDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).sort({ billingDate: -1, createdAt: -1 });

    // Use tenant info from the most recent bill in current month, or fall back to latest bill
    const tenantInfoSource = currentMonthBills.length > 0 ? currentMonthBills[0] : latestBill;

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
        discount: latestBill.discount,
        airconFee: latestBill.airconFee,
        fridgeFee: latestBill.fridgeFee
      },
      
      // Metadata
      lastBillDate: latestBill.billingDate,
      lastBillId: latestBill._id,
      hasCurrentMonthBills: currentMonthBills.length > 0,
      currentMonthBillsCount: currentMonthBills.length
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

// POST endpoint to update tenant info for current month bills
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { roomId, tenantInfo, updateCurrentMonth } = body;

    if (!roomId || !tenantInfo || !updateCurrentMonth) {
      return NextResponse.json(
        { success: false, error: "Room ID, tenant info, and updateCurrentMonth flag are required" },
        { status: 400 }
      );
    }

    console.log("Updating tenant info for current month bills:", { roomId, updateCurrentMonth });

    // Get current month date range
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Update all bills in current month for this room
    const updateResult = await Bill.updateMany(
      {
        roomId: roomId,
        billingDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      },
      {
        $set: {
          tenantName: tenantInfo.tenantName,
          tenantAddress: tenantInfo.tenantAddress,
          tenantPhone: tenantInfo.tenantPhone,
          tenantTaxId: tenantInfo.tenantTaxId
        }
      }
    );

    console.log("Tenant info update result:", updateResult);

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount
      }
    });
  } catch (error: unknown) {
    console.error("Error updating tenant info:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to update tenant info", details: errorMessage },
      { status: 500 }
    );
  }
}