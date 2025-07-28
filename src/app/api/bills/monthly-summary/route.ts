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
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const apartmentId = searchParams.get("apartmentId");

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: "Month and year parameters are required" },
        { status: 400 }
      );
    }

    // Create date range for the specified month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    console.log("Fetching monthly summary for:", { month, year, startDate, endDate });

    // Build query with apartment filter if provided
    const query: {
      billingDate: {
        $gte: Date;
        $lte: Date;
      };
      apartmentId?: string;
    } = {
      billingDate: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (apartmentId) {
      query.apartmentId = apartmentId;
    }

    // Find all bills within the month range and apartment filter
    const bills = await Bill.find(query)
      .populate("apartmentId", "name")
      .populate("roomId", "roomNumber")
      .sort({ "roomId.roomNumber": 1, billingDate: 1 }) as unknown as PopulatedBill[];

    // Generate bill numbers with invoice ID as running sequence
    const billsWithNumbers = bills.map((bill, index) => {
      // Use index + 1 as the invoice sequence for the month
      const invoiceSequence = index + 1;
      const billNumber = `${month.padStart(2, '0')}${year.slice(-2)}-${invoiceSequence.toString().padStart(3, '0')}`;
      
      // Calculate other fees total
      const otherFeesTotal = bill.otherFees.reduce((sum, fee) => sum + fee.amount, 0);

      return {
        _id: bill._id,
        billNumber,
        roomNumber: bill.roomId.roomNumber,
        apartmentName: bill.apartmentId.name,
        tenantName: bill.tenantName,
        rentalPeriod: bill.rentalPeriod,
        rent: bill.netRent,
        electricityCost: bill.electricityCost,
        customUtilitiesCost: bill.customUtilitiesCost,
        otherFeesTotal,
        grandTotal: bill.grandTotal,
        billingDate: bill.billingDate
      };
    });

    console.log("Monthly summary fetched successfully:", billsWithNumbers.length);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        month: parseInt(month),
        year: parseInt(year),
        bills: billsWithNumbers,
        summary: {
          totalBills: billsWithNumbers.length,
          totalRent: billsWithNumbers.reduce((sum, bill) => sum + bill.rent, 0),
          totalElectricity: billsWithNumbers.reduce((sum, bill) => sum + bill.electricityCost, 0),
          totalCustomUtilities: billsWithNumbers.reduce((sum, bill) => sum + bill.customUtilitiesCost, 0),
          totalOtherFees: billsWithNumbers.reduce((sum, bill) => sum + bill.otherFeesTotal, 0),
          grandTotal: billsWithNumbers.reduce((sum, bill) => sum + bill.grandTotal, 0)
        }
      }
    });
  } catch (error: unknown) {
    console.error("Error fetching monthly summary:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch monthly summary", details: errorMessage },
      { status: 500 }
    );
  }
}