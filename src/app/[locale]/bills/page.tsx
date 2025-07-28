"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, FileText, Plus, Download, Eye, Filter } from "lucide-react";
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

export default function BillsPage() {
  const t = useTranslations("bills");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [bills, setBills] = useState<Bill[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApartments();
    fetchBills();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [selectedApartmentId]);

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

  const fetchBills = async () => {
    try {
      const url = selectedApartmentId
        ? `/api/bills?apartmentId=${selectedApartmentId}`
        : "/api/bills";
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setBills(data.data);
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

        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <label
              htmlFor="apartmentFilter"
              className="text-sm font-medium text-gray-700"
            >
              {t("filterByApartment")}:
            </label>
            <select
              id="apartmentFilter"
              value={selectedApartmentId}
              onChange={(e) => setSelectedApartmentId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("allApartments")}</option>
              {apartments.map((apartment) => (
                <option key={apartment._id} value={apartment._id}>
                  {apartment.name}
                </option>
              ))}
            </select>
            {selectedApartmentId && (
              <button
                onClick={() => setSelectedApartmentId("")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t("clearFilter")}
              </button>
            )}
          </div>
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
      </div>
    </div>
  );
}
