'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface BillSummary {
  _id: string;
  billNumber: string;
  roomNumber: string;
  apartmentName: string;
  tenantName: string;
  rentalPeriod: {
    from: string;
    to: string;
  };
  rent: number;
  electricityCost: number;
  waterCost: number;
  otherFeesTotal: number;
  grandTotal: number;
  billingDate: string;
}

interface MonthlySummaryData {
  month: number;
  year: number;
  bills: BillSummary[];
  summary: {
    totalBills: number;
    totalRent: number;
    totalElectricity: number;
    totalWater: number;
    totalOtherFees: number;
    grandTotal: number;
  };
}

export default function MonthlySummaryPDFPage() {
  const t = useTranslations('monthlySum');
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [locale, setLocale] = useState('th');

  useEffect(() => {
    // Get data from localStorage (passed from main page)
    const storedData = localStorage.getItem('monthlySummaryData');
    const storedLocale = localStorage.getItem('monthlySummaryLocale');
    
    if (storedData) {
      setData(JSON.parse(storedData));
    }
    
    if (storedLocale) {
      setLocale(storedLocale);
    }

    // Auto-print after component loads
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: locale === 'th' ? 'numeric' : '2-digit'
    });
  };

  const formatDateRange = (from: string, to: string) => {
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

  const getMonthName = (month: number) => {
    const monthNames = locale === 'th' 
      ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
         'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
      : ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
  };

  if (!data) {
    return (
      <div className="p-8 text-center">
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-none" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {t('pdfTitle')} - {getMonthName(data.month)} {data.year}
        </h1>
        <p className="text-gray-600">
          {t('summaryFor')} {getMonthName(data.month)} {data.year}
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6 p-4 border border-gray-300 rounded">
        <h2 className="text-lg font-semibold mb-3">{t('summaryOverview')}</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">{t('totalBills')}:</span> {data.summary.totalBills}
          </div>
          <div>
            <span className="font-medium">{t('totalRent')}:</span> {formatCurrency(data.summary.totalRent)}
          </div>
          <div>
            <span className="font-medium">{t('totalElectricity')}:</span> {formatCurrency(data.summary.totalElectricity)}
          </div>
          <div>
            <span className="font-medium">{t('totalWater')}:</span> {formatCurrency(data.summary.totalWater)}
          </div>
          <div>
            <span className="font-medium">{t('totalOtherFees')}:</span> {formatCurrency(data.summary.totalOtherFees)}
          </div>
          <div>
            <span className="font-medium">{t('grandTotal')}:</span> {formatCurrency(data.summary.grandTotal)}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <table className="w-full border-collapse border border-gray-300" style={{ fontSize: '12px' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-2 text-left">{t('billNumber')}</th>
            <th className="border border-gray-300 px-2 py-2 text-left">{t('roomNumber')}</th>
            <th className="border border-gray-300 px-2 py-2 text-left">{t('tenantName')}</th>
            <th className="border border-gray-300 px-2 py-2 text-left">{t('rentalPeriod')}</th>
            <th className="border border-gray-300 px-2 py-2 text-right">{t('rentCost')}</th>
            <th className="border border-gray-300 px-2 py-2 text-right">{t('electricityCost')}</th>
            <th className="border border-gray-300 px-2 py-2 text-right">{t('waterCost')}</th>
            <th className="border border-gray-300 px-2 py-2 text-right">{t('otherFees')}</th>
            <th className="border border-gray-300 px-2 py-2 text-right">{t('totalCost')}</th>
          </tr>
        </thead>
        <tbody>
          {data.bills.map((bill, index) => (
            <tr key={bill._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-2 py-2">{bill.billNumber}</td>
              <td className="border border-gray-300 px-2 py-2">{bill.roomNumber}</td>
              <td className="border border-gray-300 px-2 py-2">{bill.tenantName}</td>
              <td className="border border-gray-300 px-2 py-2">
                {formatDateRange(bill.rentalPeriod.from, bill.rentalPeriod.to)}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right">
                {formatCurrency(bill.rent)}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right">
                {formatCurrency(bill.electricityCost)}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right">
                {formatCurrency(bill.waterCost)}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right">
                {formatCurrency(bill.otherFeesTotal)}
              </td>
              <td className="border border-gray-300 px-2 py-2 text-right font-medium">
                {formatCurrency(bill.grandTotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-200 font-bold">
            <td colSpan={4} className="border border-gray-300 px-2 py-2 text-right">
              {t('totals')}:
            </td>
            <td className="border border-gray-300 px-2 py-2 text-right">
              {formatCurrency(data.summary.totalRent)}
            </td>
            <td className="border border-gray-300 px-2 py-2 text-right">
              {formatCurrency(data.summary.totalElectricity)}
            </td>
            <td className="border border-gray-300 px-2 py-2 text-right">
              {formatCurrency(data.summary.totalWater)}
            </td>
            <td className="border border-gray-300 px-2 py-2 text-right">
              {formatCurrency(data.summary.totalOtherFees)}
            </td>
            <td className="border border-gray-300 px-2 py-2 text-right">
              {formatCurrency(data.summary.grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>{t('generatedOn')}: {new Date().toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')}</p>
      </div>

      <style jsx global>{`
        @media print {
          body { margin: 0; }
          .container { max-width: none; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}