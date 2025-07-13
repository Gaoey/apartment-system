'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, FileText, Plus, Download, Eye } from 'lucide-react';

interface Bill {
  _id: string;
  apartmentId: {
    _id: string;
    name: string;
  };
  roomId: {
    _id: string;
    roomNumber: string;
  };
  tenantName: string;
  billingDate: string;
  rentalPeriod: {
    from: string;
    to: string;
  };
  grandTotal: number;
  documentNumber?: string;
  createdAt: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills');
      const data = await response.json();
      if (data.success) {
        setBills(data.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bill Management</h1>
          </div>
          <Link
            href="/bills/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Bill
          </Link>
        </div>

        {bills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bills yet</h3>
            <p className="text-gray-600 mb-4">Create your first bill to start tracking tenant payments</p>
            <Link
              href="/bills/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Bill
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {bill.tenantName}
                      </h3>
                      {bill.documentNumber && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          #{bill.documentNumber}
                        </span>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Building:</span> {bill.apartmentId.name}
                      </div>
                      <div>
                        <span className="font-medium">Room:</span> {bill.roomId.roomNumber}
                      </div>
                      <div>
                        <span className="font-medium">Period:</span>{' '}
                        {formatDate(bill.rentalPeriod.from)} - {formatDate(bill.rentalPeriod.to)}
                      </div>
                      <div>
                        <span className="font-medium">Bill Date:</span> {formatDate(bill.billingDate)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-6">
                      <div className="text-lg font-semibold text-green-600">
                        Total: {formatCurrency(bill.grandTotal)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(bill.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/bills/${bill._id}`}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Link>
                    <Link
                      href={`/bills/${bill._id}/pdf`}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}