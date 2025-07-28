"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  FileText,
  Download,
  Building,
  User,
  Calendar,
  Receipt,
  Edit,
  Trash2,
} from "lucide-react";
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
  rentalPeriod: {
    from: string;
    to: string;
  };
  rent: number;
  discounts: Array<{
    description: string;
    amount: number;
  }>;
  electricity?: {
    startMeter: number;
    endMeter: number;
    rate: number;
    meterFee: number;
  };
  water?: {
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
  netRent: number;
  electricityCost: number;
  waterCost: number;
  grandTotal: number;
  documentNumber?: string;
  createdAt: string;
}

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations("bill");
  const tb = useTranslations("bills");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
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
      fetchBill();
    }
  }, [billId]);

  const fetchBill = async () => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
      style: "currency",
      currency: "THB",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
  };

  const handleDelete = async () => {
    if (!bill || deleting) return;

    const confirmed = window.confirm(
      locale === "th"
        ? "คุณแน่ใจหรือไม่ที่ต้องการลบใบแจ้งหนี้นี้?"
        : "Are you sure you want to delete this bill?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/${locale}/bills`);
      } else {
        alert(data.error || "Failed to delete bill");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Network error occurred");
    } finally {
      setDeleting(false);
    }
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
            {tb("billNotFound")}
          </h2>
          <Link
            href={`/${locale}/bills`}
            className="text-blue-600 hover:text-blue-800"
          >
            {tc("back")} {tb("title")}
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
            <span className="text-gray-400">/</span>
            <h1 className="text-3xl font-bold text-gray-900">
              {tb("billDetails")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/bills/${bill._id}/edit`}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              {tc("edit")}
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting..." : tc("delete")}
            </button>
            <Link
              href={`/${locale}/bills/${bill._id}/pdf`}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              {tb("downloadPDF")}
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-blue-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("title")}
                  </h2>
                  <p className="text-gray-600">
                    {t("billId")}: {bill.runningNumber}
                  </p>
                  {bill.documentNumber && (
                    <p className="text-gray-600">
                      {t("documentNumber")}: {bill.documentNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{t("billingDate")}</p>
                <p className="text-lg font-semibold">
                  {formatDate(bill.billingDate)}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Owner Information Row */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("ownerInfo")}
                  </h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">{t("ownerName")}:</span>{" "}
                    {owner?.name || bill.apartmentId.name}
                  </p>
                  <p>
                    <span className="font-medium">{t("ownerAddress")}:</span>{" "}
                    {owner?.address || bill.apartmentId.address}
                  </p>
                  <p>
                    <span className="font-medium">{t("ownerPhone")}:</span>{" "}
                    {owner?.phone || bill.apartmentId.phone}
                  </p>
                  {owner?.taxId && (
                    <p>
                      <span className="font-medium">{t("ownerTaxId")}:</span>{" "}
                      {owner.taxId}
                    </p>
                  )}
                </div>
              </div>

              {/* Apartment Information Row */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("propertyInfo")}
                  </h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">{t("apartment")}:</span>{" "}
                    {bill.apartmentId.name}
                  </p>
                  <p>
                    <span className="font-medium">{t("room")}:</span>{" "}
                    {bill.roomId.roomNumber}
                  </p>
                  <p>
                    <span className="font-medium">{t("propertyAddress")}:</span>{" "}
                    {bill.apartmentId.address}
                  </p>
                  <p>
                    <span className="font-medium">{t("propertyPhone")}:</span>{" "}
                    {bill.apartmentId.phone}
                  </p>
                </div>
              </div>

              {/* Tenant Information Row */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">
                    {t("tenantInfo")}
                  </h3>
                </div>
                <div className="grid md:grid-cols-4 gap-4 text-gray-700">
                  <p>
                    <span className="font-medium">{t("tenantName")}:</span>{" "}
                    {bill.tenantName}
                  </p>
                  <p>
                    <span className="font-medium">{t("tenantAddress")}:</span>{" "}
                    {bill.tenantAddress}
                  </p>
                  <p>
                    <span className="font-medium">{t("tenantPhone")}:</span>{" "}
                    {bill.tenantPhone}
                  </p>
                  {bill.tenantTaxId && (
                    <p>
                      <span className="font-medium">{t("tenantTaxId")}:</span>{" "}
                      {bill.tenantTaxId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {t("rentalPeriod")}
                </h3>
              </div>
              <p className="text-gray-700">
                {formatDate(bill.rentalPeriod.from)} -{" "}
                {formatDate(bill.rentalPeriod.to)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-6">
              {t("billingDetails")}
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">{t("rent")}</span>
                <span className="font-medium">{formatCurrency(bill.rent)}</span>
              </div>

              {bill.discounts && bill.discounts.length > 0 && (
                <div className="space-y-2">
                  {bill.discounts.map((discount, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-700">
                        {discount.description}
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(discount.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">{t("netRent")}</span>
                <span className="font-medium">
                  {formatCurrency(bill.netRent)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-gray-700">{t("electricity")}</span>
                    {bill.electricity &&
                    bill.electricity.endMeter !== undefined &&
                    bill.electricity.startMeter !== undefined ? (
                      <div className="text-sm text-gray-500">
                        {bill.electricity.endMeter -
                          bill.electricity.startMeter}{" "}
                        {t("electricityUnit")} ×{" "}
                        {formatCurrency(bill.electricity.rate)} +{" "}
                        {formatCurrency(bill.electricity.meterFee)}{" "}
                        {t("meterFee")}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Electricity usage details not available
                      </div>
                    )}
                  </div>
                  <span className="font-medium">
                    {formatCurrency(bill.electricityCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-gray-700">{t("water")}</span>
                    {bill.water &&
                    bill.water.endMeter !== undefined &&
                    bill.water.startMeter !== undefined ? (
                      <div className="text-sm text-gray-500">
                        {bill.water.endMeter - bill.water.startMeter}{" "}
                        {t("waterUnit")} ×{" "}
                        {formatCurrency(bill.water.rate)} +{" "}
                        {formatCurrency(bill.water.meterFee)}{" "}
                        {t("meterFee")}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Water usage details not available
                      </div>
                    )}
                  </div>
                  <span className="font-medium">
                    {formatCurrency(bill.waterCost)}
                  </span>
                </div>

                {bill.airconFee > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">{t("airconFee")}</span>
                    <span className="font-medium">
                      {formatCurrency(bill.airconFee)}
                    </span>
                  </div>
                )}

                {bill.fridgeFee > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700">{t("fridgeFee")}</span>
                    <span className="font-medium">
                      {formatCurrency(bill.fridgeFee)}
                    </span>
                  </div>
                )}
              </div>


              {bill.otherFees.length > 0 && (
                <div className="space-y-2">
                  {bill.otherFees.map((fee, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      <span className="text-gray-700">{fee.description}</span>
                      <span className="font-medium">
                        {formatCurrency(fee.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t-2 border-gray-200 mt-4">
                <span className="text-xl font-semibold text-gray-900">
                  {t("grandTotal")}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(bill.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {t("additionalInfo")}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">{tc("created")}:</span>{" "}
                {formatDate(bill.createdAt)}
              </p>
              <p>
                <span className="font-medium">{t("billId")}:</span>{" "}
                {bill.runningNumber}
              </p>
              <p>
                <span className="font-medium">Position in month:</span>{" "}
                {bill.billPosition} of {bill.totalBillsInMonth}
              </p>
              <p>
                <span className="font-medium">Internal ID:</span> {bill._id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
