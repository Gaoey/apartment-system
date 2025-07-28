import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bill from "@/models/Bill";
import Room from "@/models/Room";
import Apartment from "@/models/Apartment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    // Ensure models are registered
    void Room;
    void Apartment;
    
    const { id: billId } = await params;

    // Find the specific bill
    const bill = await Bill.findById(billId)
      .populate("apartmentId", "name address phone taxId")
      .populate("roomId", "roomNumber");

    if (!bill) {
      return NextResponse.json(
        { success: false, error: "Bill not found" },
        { status: 404 }
      );
    }

    // Generate running number based on bill's position in the month
    const billDate = new Date(bill.billingDate);
    const year = billDate.getFullYear();
    const month = billDate.getMonth() + 1;
    
    // Find all bills in the same month, sorted by creation date
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const billsInMonth = await Bill.find({
      billingDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: 1 }); // Sort by creation order
    
    // Find the position of current bill in the month
    const billPosition = billsInMonth.findIndex((b) => (b._id as string).toString() === billId) + 1;
    
    // Generate running number: MMYY-XXX
    const runningNumber = `${month.toString().padStart(2, '0')}${year.toString().slice(-2)}-${billPosition.toString().padStart(3, '0')}`;

    // Calculate other fees total
    const otherFeesTotal = bill.otherFees.reduce((sum, fee) => sum + fee.amount, 0);

    const billWithRunningNumber = {
      _id: bill._id,
      runningNumber,
      billPosition,
      totalBillsInMonth: billsInMonth.length,
      apartmentId: bill.apartmentId,
      roomId: bill.roomId,
      billingDate: bill.billingDate,
      paymentDueDate: bill.paymentDueDate,
      tenantName: bill.tenantName,
      tenantAddress: bill.tenantAddress,
      tenantPhone: bill.tenantPhone,
      tenantTaxId: bill.tenantTaxId,
      rentalPeriod: bill.rentalPeriod,
      rent: bill.rent,
      discounts: bill.discounts,
      netRent: bill.netRent,
      electricity: bill.electricity,
      electricityCost: bill.electricityCost,
      customUtilities: bill.customUtilities,
      customUtilitiesCost: bill.customUtilitiesCost,
      otherFees: bill.otherFees,
      otherFeesTotal,
      grandTotal: bill.grandTotal,
      documentNumber: bill.documentNumber,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: billWithRunningNumber
    });
  } catch (error: unknown) {
    console.error("Error fetching bill with running number:", error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' 
      ? error.message 
      : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: "Failed to fetch bill", details: errorMessage },
      { status: 500 }
    );
  }
}