'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, FileText, Download, ArrowLeft } from 'lucide-react';

interface Owner {
  name: string;
  address: string;
  phone: string;
  taxId: string;
}

interface Bill {
  _id: string;
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
  otherFees: number;
  netRent: number;
  electricityCost: number;
  waterCost: number;
  grandTotal: number;
  documentNumber?: string;
  createdAt: string;
}

export default function BillPDFPage({ params }: { params: { id: string } }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billRes, ownerRes] = await Promise.all([
        fetch(`/api/bills/${params.id}`),
        fetch('/api/owner')
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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill not found</h2>
          <Link href="/bills" className="text-blue-600 hover:text-blue-800">
            Back to bills
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
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                <Home className="w-5 h-5" />
              </Link>
              <Link href="/bills" className="text-blue-600 hover:text-blue-800">
                <FileText className="w-5 h-5" />
              </Link>
              <Link href={`/bills/${bill._id}`} className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Bill PDF</h1>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Print/Save PDF
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="container mx-auto px-8 py-8 print:p-0 print:m-0 max-w-4xl">
          <div className="bg-white print:shadow-none">
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              {bill.documentNumber && (
                <p className="text-lg text-gray-600">Document #: {bill.documentNumber}</p>
              )}
            </div>

            {/* Company and Bill Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">From:</h3>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{owner?.name || 'Owner Name'}</p>
                  <p className="text-gray-700">{owner?.address || 'Owner Address'}</p>
                  <p className="text-gray-700">Phone: {owner?.phone || 'Owner Phone'}</p>
                  <p className="text-gray-700">Tax ID: {owner?.taxId || 'Owner Tax ID'}</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill Information:</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">Date:</span> {formatDate(bill.billingDate)}</p>
                  <p><span className="font-medium">Property:</span> {bill.apartmentId.name}</p>
                  <p><span className="font-medium">Room:</span> {bill.roomId.roomNumber}</p>
                  <p><span className="font-medium">Period:</span> {formatDate(bill.rentalPeriod.from)} - {formatDate(bill.rentalPeriod.to)}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{bill.tenantName}</p>
                <p className="text-gray-700">{bill.tenantAddress}</p>
                <p className="text-gray-700">Phone: {bill.tenantPhone}</p>
                <p className="text-gray-700">Tax ID: {bill.tenantTaxId}</p>
              </div>
            </div>

            {/* Bill Details Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Room Rent</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.rent)}</td>
                  </tr>
                  {bill.discount > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Discount</td>
                      <td className="border border-gray-300 px-4 py-2 text-right text-red-600">-{formatCurrency(bill.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Net Rent</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.netRent)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Electricity ({bill.electricity.endMeter - bill.electricity.startMeter} units × {formatCurrency(bill.electricity.rate)} + {formatCurrency(bill.electricity.meterFee)} meter fee)
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.electricityCost)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      Water ({bill.water.endMeter - bill.water.startMeter} units × {formatCurrency(bill.water.rate)} + {formatCurrency(bill.water.meterFee)} meter fee)
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.waterCost)}</td>
                  </tr>
                  {bill.airconFee > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Air Conditioning Fee</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.airconFee)}</td>
                    </tr>
                  )}
                  {bill.fridgeFee > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Refrigerator Fee</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.fridgeFee)}</td>
                    </tr>
                  )}
                  {bill.otherFees > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Other Fees</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.otherFees)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 px-4 py-3">TOTAL</td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-xl">{formatCurrency(bill.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 mt-12">
              <p>Thank you for your payment!</p>
              <p>Generated on {new Date().toLocaleDateString('th-TH')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}