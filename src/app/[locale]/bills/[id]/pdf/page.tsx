'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, FileText, Download, ArrowLeft } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

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

export default function BillPDFPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const t = useTranslations('bill');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [bill, setBill] = useState<Bill | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
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
      fetchData();
    }
  }, [billId]);

  const fetchData = async () => {
    try {
      const [billRes, ownerRes] = await Promise.all([
        fetch(`/api/bills/${billId}`),
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
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
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
        <div className="text-lg">{tc('loading')}</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('billNotFound')}</h2>
          <Link href={`/${locale}/bills`} className="text-blue-600 hover:text-blue-800">
            {tc('back')} {t('title')}
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
              <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-800">
                <Home className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/bills`} className="text-blue-600 hover:text-blue-800">
                <FileText className="w-5 h-5" />
              </Link>
              <Link href={`/${locale}/bills/${bill._id}`} className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{t('pdfTitle')}</h1>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('printSavePDF')}
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="container mx-auto px-8 py-8 print:p-0 print:m-0 max-w-4xl">
          <div className="bg-white print:shadow-none">
            {/* Invoice Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title').toUpperCase()}</h1>
              {bill.documentNumber && (
                <p className="text-lg text-gray-600">{t('documentNumber')}: {bill.documentNumber}</p>
              )}
            </div>

            {/* Company and Bill Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('from')}:</h3>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{owner?.name || t('ownerName')}</p>
                  <p className="text-gray-700">{owner?.address || t('ownerAddress')}</p>
                  <p className="text-gray-700">{t('tenantPhone')}: {owner?.phone || t('ownerPhone')}</p>
                  <p className="text-gray-700">{t('tenantTaxId')}: {owner?.taxId || t('ownerTaxId')}</p>
                </div>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('billInformation')}:</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">{t('billingDate')}:</span> {formatDate(bill.billingDate)}</p>
                  <p><span className="font-medium">{t('apartment')}:</span> {bill.apartmentId.name}</p>
                  <p><span className="font-medium">{t('room')}:</span> {bill.roomId.roomNumber}</p>
                  <p><span className="font-medium">{t('rentalPeriod')}:</span> {formatDate(bill.rentalPeriod.from)} - {formatDate(bill.rentalPeriod.to)}</p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('billTo')}:</h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{bill.tenantName}</p>
                <p className="text-gray-700">{bill.tenantAddress}</p>
                <p className="text-gray-700">{t('tenantPhone')}: {bill.tenantPhone}</p>
                <p className="text-gray-700">{t('tenantTaxId')}: {bill.tenantTaxId}</p>
              </div>
            </div>

            {/* Bill Details Table */}
            <div className="mb-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">{t('description')}</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">{t('rent')}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.rent)}</td>
                  </tr>
                  {bill.discount > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">{t('discount')}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right text-red-600">-{formatCurrency(bill.discount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">{t('netRent')}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.netRent)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      {t('electricity')} ({bill.electricity.endMeter - bill.electricity.startMeter} {t('electricityUnit')} × {formatCurrency(bill.electricity.rate)} + {formatCurrency(bill.electricity.meterFee)} {t('meterFee')})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.electricityCost)}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      {t('water')} ({bill.water.endMeter - bill.water.startMeter} {t('waterUnit')} × {formatCurrency(bill.water.rate)} + {formatCurrency(bill.water.meterFee)} {t('meterFee')})
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.waterCost)}</td>
                  </tr>
                  {bill.airconFee > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">{t('airconFee')}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.airconFee)}</td>
                    </tr>
                  )}
                  {bill.fridgeFee > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">{t('fridgeFee')}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.fridgeFee)}</td>
                    </tr>
                  )}
                  {bill.otherFees > 0 && (
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">{t('otherFees')}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(bill.otherFees)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-300 px-4 py-3">{t('grandTotal').toUpperCase()}</td>
                    <td className="border border-gray-300 px-4 py-3 text-right text-xl">{formatCurrency(bill.grandTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 mt-12">
              <p>{t('thankYou')}</p>
              <p>{t('generatedOn')} {new Date().toLocaleDateString(locale)}</p>
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