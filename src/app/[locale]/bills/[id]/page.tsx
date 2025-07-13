'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, FileText, Download, Building, User, Calendar, Receipt } from 'lucide-react';

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

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [billId, setBillId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBillId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (billId) {
      fetchBill();
    }
  }, [billId]);

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      const data = await response.json();
      if (data.success) {
        setBill(data.data);
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/bills" className="text-blue-600 hover:text-blue-800">
              <FileText className="w-5 h-5" />
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900">Bill Details</h1>
          </div>
          <Link
            href={`/bills/${bill._id}/pdf`}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
                  {bill.documentNumber && (
                    <p className="text-gray-600">Document #: {bill.documentNumber}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Bill Date</p>
                <p className="text-lg font-semibold">{formatDate(bill.billingDate)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Property Information</h3>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">Building:</span> {bill.apartmentId.name}</p>
                  <p><span className="font-medium">Room:</span> {bill.roomId.roomNumber}</p>
                  <p><span className="font-medium">Address:</span> {bill.apartmentId.address}</p>
                  <p><span className="font-medium">Phone:</span> {bill.apartmentId.phone}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Tenant Information</h3>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p><span className="font-medium">Name:</span> {bill.tenantName}</p>
                  <p><span className="font-medium">Address:</span> {bill.tenantAddress}</p>
                  <p><span className="font-medium">Phone:</span> {bill.tenantPhone}</p>
                  <p><span className="font-medium">Tax ID:</span> {bill.tenantTaxId}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Rental Period</h3>
              </div>
              <p className="text-gray-700">
                {formatDate(bill.rentalPeriod.from)} - {formatDate(bill.rentalPeriod.to)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">Billing Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Room Rent</span>
                <span className="font-medium">{formatCurrency(bill.rent)}</span>
              </div>
              
              {bill.discount > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(bill.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Net Rent</span>
                <span className="font-medium">{formatCurrency(bill.netRent)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-gray-700">Electricity</span>
                    <div className="text-sm text-gray-500">
                      {bill.electricity.endMeter - bill.electricity.startMeter} units × {formatCurrency(bill.electricity.rate)} + {formatCurrency(bill.electricity.meterFee)} meter fee
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(bill.electricityCost)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-gray-700">Water</span>
                    <div className="text-sm text-gray-500">
                      {bill.water.endMeter - bill.water.startMeter} units × {formatCurrency(bill.water.rate)} + {formatCurrency(bill.water.meterFee)} meter fee
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(bill.waterCost)}</span>
                </div>
              </div>

              {bill.airconFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Air Conditioning Fee</span>
                  <span className="font-medium">{formatCurrency(bill.airconFee)}</span>
                </div>
              )}

              {bill.fridgeFee > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Refrigerator Fee</span>
                  <span className="font-medium">{formatCurrency(bill.fridgeFee)}</span>
                </div>
              )}

              {bill.otherFees > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Other Fees</span>
                  <span className="font-medium">{formatCurrency(bill.otherFees)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t-2 border-gray-200 mt-4">
                <span className="text-xl font-semibold text-gray-900">Grand Total</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(bill.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Created:</span> {formatDate(bill.createdAt)}</p>
              <p><span className="font-medium">Bill ID:</span> {bill._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}