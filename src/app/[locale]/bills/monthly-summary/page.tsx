'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Download, FileText } from 'lucide-react';

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

export default function MonthlySummaryPage() {
  const t = useTranslations('monthlySum');
  const tc = useTranslations('common');
  const locale = useLocale();
  
  const [data, setData] = useState<MonthlySummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default to current month and year
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const fetchMonthlySummary = async () => {
    if (!selectedMonth || !selectedYear) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/bills/monthly-summary?month=${selectedMonth}&year=${selectedYear}`
      );
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch monthly summary');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching monthly summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlySummary();
  }, [selectedMonth, selectedYear]);

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
      year: 'numeric'
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

  const exportToPDF = () => {
    if (!data) return;
    
    // Create a new window for PDF export
    const printWindow = window.open('/bills/monthly-summary/pdf', '_blank');
    if (printWindow) {
      // Pass data through localStorage for the PDF page
      localStorage.setItem('monthlySummaryData', JSON.stringify(data));
      localStorage.setItem('monthlySummaryLocale', locale);
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {t('title')}
              </h1>
              <p className="text-gray-600 mt-1">{t('description')}</p>
            </div>
            
            {data && (
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('exportPDF')}
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Month/Year Selection */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <label className="font-medium text-gray-700">{t('selectMonth')}:</label>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month} value={month}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">{tc('loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Summary Data */}
          {data && !loading && (
            <>
              {/* Summary Header */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('summaryFor')} {getMonthName(data.month)} {data.year}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{t('totalBills')}:</span>
                    <div className="font-semibold">{data.summary.totalBills}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('totalRent')}:</span>
                    <div className="font-semibold">{formatCurrency(data.summary.totalRent)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('totalElectricity')}:</span>
                    <div className="font-semibold">{formatCurrency(data.summary.totalElectricity)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('totalWater')}:</span>
                    <div className="font-semibold">{formatCurrency(data.summary.totalWater)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('totalOtherFees')}:</span>
                    <div className="font-semibold">{formatCurrency(data.summary.totalOtherFees)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">{t('grandTotal')}:</span>
                    <div className="font-semibold text-blue-600">{formatCurrency(data.summary.grandTotal)}</div>
                  </div>
                </div>
              </div>

              {/* Bills Table */}
              {data.bills.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('billNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('roomNumber')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('tenantName')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('rentalPeriod')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('rentCost')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('electricityCost')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('waterCost')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('otherFees')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('totalCost')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.bills.map((bill) => (
                        <tr key={bill._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {bill.billNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bill.roomNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {bill.tenantName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateRange(bill.rentalPeriod.from, bill.rentalPeriod.to)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(bill.rent)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(bill.electricityCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(bill.waterCost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {formatCurrency(bill.otherFeesTotal)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(bill.grandTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('noBills')}
                  </h3>
                  <p className="text-gray-600">
                    {t('noBillsDescription')}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}