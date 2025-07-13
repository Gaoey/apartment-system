"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, FileText, Download, ArrowLeft } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Owner {
  name: string;
  address: string;
  phone: string;
  taxId: string;
}

interface Bill {
  _id: string;
  runningNumber: string;
  billPosition: number;
  totalBillsInMonth: number;
  apartmentId: {
    _id: string;
    name: string;
    address: string;
    phone: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  tenantName: string;
  tenantAddress: string;
  tenantPhone: string;
  tenantTaxId: string;
  billingDate: string;
  paymentDueDate?: string;
  rentalPeriod: {
    from: string;
    to: string;
  };
  rent: number;
  discount: number;
  electricity: {
    startMeter: number;
    endMeter: number;
    rate: number;
    meterFee: number;
  };
  water: {
    startMeter: number;
    endMeter: number;
    rate: number;
    meterFee: number;
  };
  airconFee: number;
  fridgeFee: number;
  otherFees: Array<{
    description: string;
    amount: number;
  }>;
  otherFeesTotal: number;
  netRent: number;
  electricityCost: number;
  waterCost: number;
  grandTotal: number;
  documentNumber?: string;
  createdAt: string;
}

export default function BillPDFPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations("bill");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [bill, setBill] = useState<Bill | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [billId, setBillId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBillId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (billId) {
      fetchData();
    }
  }, [billId]);

  const fetchData = async () => {
    try {
      const [billRes, ownerRes] = await Promise.all([
        fetch(`/api/bills/${billId}/with-running-number`),
        fetch("/api/owner"),
      ]);

      const billData = await billRes.json();
      const ownerData = await ownerRes.json();

      if (billData.success) {
        setBill(billData.data);
      }
      if (ownerData.success) {
        setOwner(ownerData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{tc("loading")}</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("billNotFound")}
          </h2>
          <Link
            href={`/${locale}/bills`}
            className="text-blue-600 hover:text-blue-800"
          >
            {tc("back")} {t("title")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white print:bg-white">
        {/* Header - Hidden in print */}
        <div className="print:hidden bg-gray-50 border-b px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/${locale}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <Home className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/bills`}
                className="text-blue-600 hover:text-blue-800"
              >
                <FileText className="w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/bills/${bill._id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                {t("pdfTitle")}
              </h1>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t("printSavePDF")}
            </button>
          </div>
        </div>

        {/* PDF Content - Compact Bill Design for A4 */}
        <div className="container mx-auto px-4 py-4 print:p-2 print:m-0 max-w-2xl print:max-w-full">
          {/* Three sections on single page */}
          <div className="space-y-6 print:space-y-4">
            {["Original", "Customer Copy", "Tax Invoice"].map((copyType) => (
              <div key={copyType} className="bg-white border border-gray-300 rounded-lg print:rounded-none print:border-gray-800 print:h-auto print:min-h-[250px]">
                {/* Header Section - Compact */}
                <div className="bg-gray-50 print:bg-white border-b border-gray-300 print:border-gray-800 p-3 print:p-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h1 className="text-base print:text-sm font-bold text-gray-900">
                        {owner?.name || bill.apartmentId.name}
                      </h1>
                      <div className="text-xs text-gray-600">
                        <p className="truncate">{owner?.address || bill.apartmentId.address}</p>
                        <p>{locale === "th" ? "โทร" : "Tel"}: {owner?.phone || bill.apartmentId.phone}</p>
                      </div>
                    </div>
                    <div className="text-center mx-3">
                      <h2 className="text-lg print:text-base font-bold text-blue-600 print:text-gray-800">
                        {locale === "th" ? "ใบแจ้งหนี้" : "BILL"}
                      </h2>
                      <p className="text-sm print:text-xs font-semibold">#{bill.runningNumber}</p>
                      <p className="text-xs">{formatDate(bill.billingDate)}</p>
                    </div>
                    <div className="text-right">
                      <div className="bg-blue-100 print:bg-gray-100 px-2 py-1 rounded print:rounded-none">
                        <p className="text-xs font-bold">{copyType}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {locale === "th" ? "ห้อง" : "Room"}: {bill.roomId.roomNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Content - Ultra Compact */}
                <div className="p-3 print:p-2">
                  {/* Tenant & Period in single row */}
                  <div className="grid grid-cols-2 gap-4 text-xs mb-2 print:mb-1">
                    <div>
                      <p><span className="font-medium">{locale === "th" ? "ผู้เช่า" : "Tenant"}:</span> {bill.tenantName}</p>
                      <p><span className="font-medium">{locale === "th" ? "โทร" : "Phone"}:</span> {bill.tenantPhone}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">{locale === "th" ? "ระยะเวลา" : "Period"}:</span> {formatDate(bill.rentalPeriod.from)} - {formatDate(bill.rentalPeriod.to)}</p>
                      <p><span className="font-medium">{locale === "th" ? "ครบกำหนด" : "Due"}:</span> {bill.paymentDueDate ? formatDate(bill.paymentDueDate) : 
                        new Date(new Date(bill.billingDate).getTime() + 7 * 24 * 60 * 60 * 1000)
                          .toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}</p>
                    </div>
                  </div>
                  
                  {/* Billing Table - Compact */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span>{locale === "th" ? "ค่าเช่า" : "Rent"}</span>
                      <span className="font-medium">{bill.rent.toLocaleString()}</span>
                    </div>
                    
                    {bill.discount > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span>{locale === "th" ? "ส่วนลด" : "Discount"}</span>
                        <span className="text-red-600">-{bill.discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="font-medium">{locale === "th" ? "ค่าเช่าสุทธิ" : "Net Rent"}</span>
                      <span className="font-semibold">{bill.netRent.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-1 border-b border-gray-200">
                      <div>
                        <span className="font-medium">{locale === "th" ? "ไฟฟ้า" : "Electric"}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {(bill.electricity.endMeter - bill.electricity.startMeter).toFixed(0)}u × {bill.electricity.rate} + {bill.electricity.meterFee}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{bill.electricityCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-1 border-b border-gray-200">
                      <div>
                        <span className="font-medium">{locale === "th" ? "น้ำ" : "Water"}</span>
                        <span className="text-[10px] text-gray-500 block">
                          {(bill.water.endMeter - bill.water.startMeter).toFixed(0)}u × {bill.water.rate} + {bill.water.meterFee}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{bill.waterCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {bill.airconFee > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span>{locale === "th" ? "แอร์" : "AC"}</span>
                        <span>{bill.airconFee.toLocaleString()}</span>
                      </div>
                    )}

                    {bill.fridgeFee > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span>{locale === "th" ? "ตู้เย็น" : "Fridge"}</span>
                        <span>{bill.fridgeFee.toLocaleString()}</span>
                      </div>
                    )}

                    {bill.otherFees.map((fee, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="truncate">{fee.description}</span>
                        <span>{fee.amount.toLocaleString()}</span>
                      </div>
                    ))}

                    {/* Grand Total */}
                    <div className="flex justify-between py-2 border-t-2 border-gray-400 bg-gray-50 print:bg-gray-100 -mx-3 print:-mx-2 px-3 print:px-2 mt-2">
                      <span className="text-sm font-bold">
                        {locale === "th" ? "รวมทั้งสิ้น" : "Total"}
                      </span>
                      <span className="text-sm font-bold text-green-600 print:text-gray-800">
                        {bill.grandTotal.toLocaleString()} {locale === "th" ? "บาท" : "THB"}
                      </span>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="grid grid-cols-2 gap-6 mt-2 print:mt-1 text-xs">
                    <div className="text-center">
                      <div className="border-t border-gray-400 mt-3 print:mt-2 pt-1">
                        <p className="text-[10px] print:text-[10px]">{locale === "th" ? "ลายเซ็นผู้รับเงิน" : "Receiver Signature"}</p>
                        <p className="text-[10px] print:text-[10px]">{locale === "th" ? "วันที่" : "Date"}: ___________</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-gray-400 mt-3 print:mt-2 pt-1">
                        <p className="text-[10px] print:text-[10px]">{locale === "th" ? "ลายเซ็นผู้จ่ายเงิน" : "Payer Signature"}</p>
                        <p className="text-[10px] print:text-[10px]">{locale === "th" ? "วันที่" : "Date"}: ___________</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4 portrait;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Force hide header and navigation */
          header,
          nav,
          .print\\:hidden,
          [class*="print:hidden"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ensure proper page layout */
          .print\\:h-auto {
            height: auto !important;
          }
          .print\\:min-h-\\[250px\\] {
            min-height: 250px !important;
          }
          .print\\:space-y-4 > * + * {
            margin-top: 1rem !important;
          }
          .print\\:max-w-full {
            max-width: 100% !important;
            width: 100% !important;
          }
          /* Remove web-specific styling */
          .print\\:text-gray-800 {
            color: #1f2937 !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:bg-gray-100 {
            background-color: #f3f4f6 !important;
          }
          .print\\:border-gray-800 {
            border-color: #1f2937 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          .print\\:m-0 {
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  );
}
