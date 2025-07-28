"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, FileText, Plus, Download, Eye, Filter, Calendar, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

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

interface Apartment {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  apartmentId: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBills: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function BillsPage() {
  const t = useTranslations("bills");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [bills, setBills] = useState<Bill[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate years for dropdown (current year ± 5 years)
  const currentDate = new Date();
  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    fetchApartments();
    fetchRooms();
    fetchBills();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchBills();
  }, [selectedApartmentId, selectedRoomId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBills();
  }, [currentPage]);

  const fetchApartments = async () => {
    try {
      const response = await fetch("/api/apartments");
      const data = await response.json();
      if (data.success) {
        setApartments(data.data);
      }
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchBills = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedApartmentId) params.append("apartmentId", selectedApartmentId);
      if (selectedRoomId) params.append("roomId", selectedRoomId);
      if (selectedMonth && selectedYear) {
        params.append("month", selectedMonth);
        params.append("year", selectedYear);
      }
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const url = `/api/bills?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setBills(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  const getMonthName = (month: number) => {
    const monthNames = locale === 'th' 
      ? ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 
         'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
      : ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
  };

  const clearAllFilters = () => {
    setSelectedApartmentId("");
    setSelectedRoomId("");
    setSelectedMonth("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  const filteredRooms = selectedApartmentId 
    ? rooms.filter(room => room.apartmentId === selectedApartmentId)
    : rooms;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{tc("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}`}
              className="text-blue-600 hover:text-blue-800"
            >
              <Home className="w-5 h-5" />
            </Link>
            <FileText className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
          </div>
          <Link
            href={`/${locale}/bills/new`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("addNew")}
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">{t("filters")}</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Apartment Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                {t("filterByApartment")}
              </label>
              <select
                value={selectedApartmentId}
                onChange={(e) => {
                  setSelectedApartmentId(e.target.value);
                  setSelectedRoomId(""); // Clear room selection when apartment changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("allApartments")}</option>
                {apartments.map((apartment) => (
                  <option key={apartment._id} value={apartment._id}>
                    {apartment.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("filterByRoom")}
              </label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("allRooms")}</option>
                {filteredRooms.map((room) => (
                  <option key={room._id} value={room._id}>
                    {t("room")} {room.roomNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t("filterByMonth")}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("allMonths")}</option>
                {months.map(month => (
                  <option key={month} value={month.toString()}>
                    {getMonthName(month)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("filterByYear")}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("allYears")}</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(selectedApartmentId || selectedRoomId || selectedMonth || selectedYear) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {t("clearAllFilters")}
              </button>
            </div>
          )}
        </div>

        {bills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("noBills")}
            </h3>
            <p className="text-gray-600 mb-4">{t("noBillsDesc")}</p>
            <Link
              href={`/${locale}/bills/new`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t("addNew")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill._id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
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
                        <span className="font-medium">{t("apartment")}:</span>{" "}
                        {bill.apartmentId.name}
                      </div>
                      <div>
                        <span className="font-medium">{t("room")}:</span>{" "}
                        {bill.roomId?.roomNumber || "none"}
                      </div>
                      <div>
                        <span className="font-medium">
                          {t("rentalPeriod")}:
                        </span>{" "}
                        {formatDate(bill.rentalPeriod.from)} -{" "}
                        {formatDate(bill.rentalPeriod.to)}
                      </div>
                      <div>
                        <span className="font-medium">{t("billDate")}:</span>{" "}
                        {formatDate(bill.billingDate)}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-6">
                      <div className="text-lg font-semibold text-green-600">
                        {t("totalAmount")}: {formatCurrency(bill.grandTotal)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {tc("created")}: {formatDate(bill.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/${locale}/bills/${bill._id}`}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      {t("viewBill")}
                    </Link>
                    <Link
                      href={`/${locale}/bills/${bill._id}/pdf`}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      {t("downloadPDF")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-md p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {t("showingResults", {
                    start: (pagination.currentPage - 1) * 10 + 1,
                    end: Math.min(pagination.currentPage * 10, pagination.totalBills),
                    total: pagination.totalBills
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("previous")}
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === pagination.totalPages || 
                        (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                      )
                      .map((page, index, array) => {
                        const showEllipsis = index > 0 && page - array[index - 1] > 1;
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === pagination.currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
