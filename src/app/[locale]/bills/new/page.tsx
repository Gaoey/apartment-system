"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home, FileText, Save, X, Plus, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Apartment {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
}

export default function NewBillPage() {
  const t = useTranslations("bill");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const tp = useTranslations("placeholder");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState(
    searchParams.get("apartmentId") || ""
  );
  const [autoFillData, setAutoFillData] = useState<{
    hasData: boolean;
    roomNumber: string;
    tenantInfo: {
      tenantName: string;
      tenantAddress: string;
      tenantPhone: string;
      tenantTaxId: string;
      lastUpdated: string;
    };
    meterReadings: {
      electricity: {
        endMeter: number;
        rate: number;
        meterFee: number;
      };
      water: {
        endMeter: number;
        rate: number;
        meterFee: number;
      };
    };
    recurringFees: {
      rent: number;
      discount: number;
      airconFee: number;
      fridgeFee: number;
    };
    lastBillDate: string;
    hasCurrentMonthBills: boolean;
  } | null>(null);
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    apartmentId: searchParams.get("apartmentId") || "",
    roomId: searchParams.get("roomId") || "",
    billingDate: new Date().toISOString().split("T")[0],
    paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    tenantName: "",
    tenantAddress: "",
    tenantPhone: "",
    tenantTaxId: "",
    rentalPeriod: {
      from: "",
      to: "",
    },
    rent: 0,
    discounts: [] as { description: string; amount: number }[],
    electricity: {
      startMeter: 0,
      endMeter: 0,
      rate: 7,
      meterFee: 50,
    },
    water: {
      startMeter: 0,
      endMeter: 0,
      rate: 15,
      meterFee: 50,
    },
    airconFee: 0,
    fridgeFee: 0,
    otherFees: [] as { description: string; amount: number }[],
  });

  const [otherFeesInput, setOtherFeesInput] = useState({
    description: "",
    amount: 0,
  });

  const [discountsInput, setDiscountsInput] = useState({
    description: "",
    amount: 0,
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    if (selectedApartmentId) {
      fetchRooms(selectedApartmentId);
    } else {
      setRooms([]);
    }
  }, [selectedApartmentId]);

  useEffect(() => {
    if (formData.roomId) {
      fetchLatestRoomData(formData.roomId);
    }
  }, [formData.roomId]);

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

  const fetchRooms = async (apartmentId: string) => {
    try {
      const response = await fetch(`/api/rooms?apartmentId=${apartmentId}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchLatestRoomData = async (roomId: string) => {
    try {
      const response = await fetch(
        `/api/bills/latest-room-data?roomId=${roomId}`
      );
      const data = await response.json();

      if (data.success && data.data.hasData) {
        const roomData = data.data;
        setAutoFillData(roomData);

        // Auto-fill tenant information
        const fieldsToFill: string[] = [];
        const newFormData = { ...formData };

        if (roomData.tenantInfo.tenantName && !formData.tenantName) {
          newFormData.tenantName = roomData.tenantInfo.tenantName;
          fieldsToFill.push("tenantName");
        }
        if (roomData.tenantInfo.tenantAddress && !formData.tenantAddress) {
          newFormData.tenantAddress = roomData.tenantInfo.tenantAddress;
          fieldsToFill.push("tenantAddress");
        }
        if (roomData.tenantInfo.tenantPhone && !formData.tenantPhone) {
          newFormData.tenantPhone = roomData.tenantInfo.tenantPhone;
          fieldsToFill.push("tenantPhone");
        }
        if (roomData.tenantInfo.tenantTaxId && !formData.tenantTaxId) {
          newFormData.tenantTaxId = roomData.tenantInfo.tenantTaxId;
          fieldsToFill.push("tenantTaxId");
        }

        // Auto-fill meter readings (use previous end readings as start readings)
        if (
          roomData.meterReadings.electricity.endMeter &&
          formData.electricity.startMeter === 0
        ) {
          newFormData.electricity.startMeter =
            roomData.meterReadings.electricity.endMeter;
          newFormData.electricity.rate =
            roomData.meterReadings.electricity.rate;
          newFormData.electricity.meterFee =
            roomData.meterReadings.electricity.meterFee;
          fieldsToFill.push(
            "electricity.startMeter",
            "electricity.rate",
            "electricity.meterFee"
          );
        }

        console.log({ roomData });
        if (
          roomData.meterReadings.water.endMeter &&
          formData.water.startMeter === 0
        ) {
          newFormData.water.startMeter = roomData.meterReadings.water.endMeter;
          newFormData.water.rate = roomData.meterReadings.water.rate;
          newFormData.water.meterFee = roomData.meterReadings.water.meterFee;
          fieldsToFill.push("water.startMeter", "water.rate", "water.meterFee");
        }

        // Auto-fill recurring fees
        if (roomData.recurringFees.rent && formData.rent === 0) {
          newFormData.rent = roomData.recurringFees.rent;
          fieldsToFill.push("rent");
        }
        if (
          roomData.recurringFees.discount &&
          formData.discounts.length === 0
        ) {
          newFormData.discounts = [
            {
              description: "Standard Discount",
              amount: roomData.recurringFees.discount,
            },
          ];
          fieldsToFill.push("discounts");
        }
        if (roomData.recurringFees.airconFee && formData.airconFee === 0) {
          newFormData.airconFee = roomData.recurringFees.airconFee;
          fieldsToFill.push("airconFee");
        }
        if (roomData.recurringFees.fridgeFee && formData.fridgeFee === 0) {
          newFormData.fridgeFee = roomData.recurringFees.fridgeFee;
          fieldsToFill.push("fridgeFee");
        }

        if (fieldsToFill.length > 0) {
          setFormData(newFormData);
          setAutoFilledFields(fieldsToFill);
          setShowAutoFillNotice(true);
        }
      }
    } catch (error) {
      console.error("Error fetching latest room data:", error);
    }
  };

  const validateForm = () => {
    const validationErrors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!formData.apartmentId) {
      validationErrors.push(tv("pleaseSelectApartment"));
      newFieldErrors.apartmentId = tv("pleaseSelectApartment");
    }
    if (!formData.roomId) {
      validationErrors.push(tv("pleaseSelectRoom"));
      newFieldErrors.roomId = tv("pleaseSelectRoom");
    }
    if (!formData.tenantName.trim()) {
      validationErrors.push(tv("tenantNameRequired"));
      newFieldErrors.tenantName = tv("tenantNameRequired");
    }
    if (!formData.tenantAddress.trim()) {
      validationErrors.push(tv("tenantAddressRequired"));
      newFieldErrors.tenantAddress = tv("tenantAddressRequired");
    }
    if (!formData.tenantPhone.trim()) {
      validationErrors.push(tv("tenantPhoneRequired"));
      newFieldErrors.tenantPhone = tv("tenantPhoneRequired");
    }
    if (!formData.tenantTaxId.trim()) {
      validationErrors.push(tv("tenantTaxIdRequired"));
      newFieldErrors.tenantTaxId = tv("tenantTaxIdRequired");
    }
    if (!formData.rentalPeriod.from) {
      validationErrors.push(tv("rentalPeriodFromRequired"));
      newFieldErrors["rentalPeriod.from"] = tv("rentalPeriodFromRequired");
    }
    if (!formData.rentalPeriod.to) {
      validationErrors.push(tv("rentalPeriodToRequired"));
      newFieldErrors["rentalPeriod.to"] = tv("rentalPeriodToRequired");
    }
    if (formData.rent <= 0) {
      validationErrors.push(tv("rentMustBeGreaterThanZero"));
      newFieldErrors.rent = tv("rentMustBeGreaterThanZero");
    }

    if (formData.rentalPeriod.from && formData.rentalPeriod.to) {
      const fromDate = new Date(formData.rentalPeriod.from);
      const toDate = new Date(formData.rentalPeriod.to);
      if (fromDate >= toDate) {
        validationErrors.push(tv("rentalPeriodFromMustBeBeforeTo"));
        newFieldErrors["rentalPeriod.to"] = tv(
          "rentalPeriodFromMustBeBeforeTo"
        );
      }
    }

    if (formData.electricity.endMeter < formData.electricity.startMeter) {
      validationErrors.push(tv("electricityEndMeterMustBeGreaterOrEqual"));
      newFieldErrors["electricity.endMeter"] = tv(
        "electricityEndMeterMustBeGreaterOrEqual"
      );
    }

    if (formData.water.endMeter < formData.water.startMeter) {
      validationErrors.push(tv("waterEndMeterMustBeGreaterOrEqual"));
      newFieldErrors["water.endMeter"] = tv(
        "waterEndMeterMustBeGreaterOrEqual"
      );
    }

    setFieldErrors(newFieldErrors);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const updateCurrentMonthTenantInfo = async () => {
    if (!formData.roomId || !autoFillData) return;

    // Check if tenant info has changed from the auto-filled data
    const tenantInfoChanged =
      formData.tenantName !== autoFillData.tenantInfo.tenantName ||
      formData.tenantAddress !== autoFillData.tenantInfo.tenantAddress ||
      formData.tenantPhone !== autoFillData.tenantInfo.tenantPhone ||
      formData.tenantTaxId !== autoFillData.tenantInfo.tenantTaxId;

    if (tenantInfoChanged && autoFillData.hasCurrentMonthBills) {
      try {
        await fetch("/api/bills/latest-room-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: formData.roomId,
            tenantInfo: {
              tenantName: formData.tenantName,
              tenantAddress: formData.tenantAddress,
              tenantPhone: formData.tenantPhone,
              tenantTaxId: formData.tenantTaxId,
            },
            updateCurrentMonth: true,
          }),
        });
      } catch (error) {
        console.error("Error updating current month tenant info:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors([]);
    setFieldErrors({});

    try {
      console.log("Sending bill data:", formData);

      // Update tenant info for current month bills if changed
      await updateCurrentMonthTenantInfo();

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/bills`);
      } else {
        console.error("API Error:", data);

        // Handle validation errors
        if (data.validationErrors) {
          const validationMessages = Object.values(
            data.validationErrors
          ) as string[];
          setErrors(validationMessages);
        } else {
          setErrors([data.error || data.details || tv("unknownErrorOccurred")]);
        }
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      setErrors([tv("networkError")]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const actualValue = type === "number" ? parseFloat(value) || 0 : value;

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev as Record<string, unknown>)[parent] as Record<
            string,
            unknown
          >),
          [child]: actualValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: actualValue,
      }));
    }
  };

  const handleApartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const apartmentId = e.target.value;
    setSelectedApartmentId(apartmentId);
    setFormData((prev) => ({
      ...prev,
      apartmentId,
      roomId: "",
    }));
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName];
  };

  const getInputClassName = (fieldName: string, baseClassName: string) => {
    const hasError = fieldErrors[fieldName];
    const isAutoFilled = autoFilledFields.includes(fieldName);

    if (hasError) {
      return `${baseClassName} border-red-500 focus:border-red-500 focus:ring-red-500`;
    } else if (isAutoFilled) {
      return `${baseClassName} border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500`;
    } else {
      return `${baseClassName} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
  };

  const isFieldAutoFilled = (fieldName: string) => {
    return autoFilledFields.includes(fieldName);
  };

  const addOtherFee = () => {
    if (otherFeesInput.description.trim() && otherFeesInput.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        otherFees: [...prev.otherFees, { ...otherFeesInput }],
      }));
      setOtherFeesInput({ description: "", amount: 0 });
    }
  };

  const addDiscount = () => {
    if (discountsInput.description.trim() && discountsInput.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        discounts: [...prev.discounts, { ...discountsInput }],
      }));
      setDiscountsInput({ description: "", amount: 0 });
    }
  };

  const removeOtherFee = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherFees: prev.otherFees.filter((_, i) => i !== index),
    }));
  };

  const removeDiscount = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }));
  };

  const calculatePreview = () => {
    const discountsTotal = formData.discounts.reduce(
      (sum, discount) => sum + discount.amount,
      0
    );
    const netRent = formData.rent - discountsTotal;
    const electricityCost =
      (formData.electricity.endMeter - formData.electricity.startMeter) *
        formData.electricity.rate +
      formData.electricity.meterFee;
    const waterCost =
      (formData.water.endMeter - formData.water.startMeter) *
        formData.water.rate +
      formData.water.meterFee;
    const otherFeesTotal = formData.otherFees.reduce(
      (sum, fee) => sum + fee.amount,
      0
    );
    const grandTotal =
      netRent +
      electricityCost +
      waterCost +
      formData.airconFee +
      formData.fridgeFee +
      otherFeesTotal;

    return {
      discountsTotal,
      netRent,
      electricityCost,
      waterCost,
      otherFeesTotal,
      grandTotal,
    };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
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
          <h1 className="text-3xl font-bold text-gray-900">{t("createNew")}</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {showAutoFillNotice && autoFillData && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-green-800 font-medium mb-2">
                    📋 Information Auto-filled from Previous Bill
                  </h4>
                  <p className="text-green-700 text-sm mb-2">
                    Tenant information and settings have been automatically
                    filled from the last bill for this room (
                    {autoFillData.roomNumber}) dated{" "}
                    {new Date(autoFillData.lastBillDate).toLocaleDateString(
                      locale === "th" ? "th-TH" : "en-US"
                    )}
                    .
                  </p>
                  {autoFillData.hasCurrentMonthBills && (
                    <p className="text-green-700 text-sm font-medium">
                      ⚠️ Note: Changing tenant information will update all bills
                      for this room in the current month.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutoFillNotice(false)}
                  className="text-green-600 hover:text-green-800 ml-4"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium mb-2">
                {tv("fixFollowingErrors")}
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("basicInfo")}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("apartment")} *
                      </label>
                      <select
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={handleApartmentChange}
                        required
                        className={getInputClassName(
                          "apartmentId",
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                        )}
                      >
                        <option value="">{t("selectApartment")}</option>
                        {apartments.map((apt) => (
                          <option key={apt._id} value={apt._id}>
                            {apt.name}
                          </option>
                        ))}
                      </select>
                      {getFieldError("apartmentId") && (
                        <p className="mt-1 text-sm text-red-600">
                          {getFieldError("apartmentId")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("room")} *
                      </label>
                      <select
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        required
                        disabled={!selectedApartmentId}
                        className={getInputClassName(
                          "roomId",
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100"
                        )}
                      >
                        <option value="">{t("selectRoom")}</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            Room {room.roomNumber}
                          </option>
                        ))}
                      </select>
                      {getFieldError("roomId") && (
                        <p className="mt-1 text-sm text-red-600">
                          {getFieldError("roomId")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("billingDate")} *
                      </label>
                      <input
                        type="date"
                        name="billingDate"
                        value={formData.billingDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("paymentDueDate")} *
                      </label>
                      <input
                        type="date"
                        name="paymentDueDate"
                        value={formData.paymentDueDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("tenantInfo")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("tenantName")} *
                        {isFieldAutoFilled("tenantName") && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Auto-filled
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className={getInputClassName(
                          "tenantName",
                          "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                        )}
                      />
                      {getFieldError("tenantName") && (
                        <p className="mt-1 text-sm text-red-600">
                          {getFieldError("tenantName")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("tenantAddress")} *
                      </label>
                      <textarea
                        name="tenantAddress"
                        value={formData.tenantAddress}
                        onChange={handleChange}
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("tenantPhone")} *
                        </label>
                        <input
                          type="tel"
                          name="tenantPhone"
                          value={formData.tenantPhone}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("tenantTaxId")} *
                        </label>
                        <input
                          type="text"
                          name="tenantTaxId"
                          value={formData.tenantTaxId}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("rentalPeriodAndCharges")}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("periodFrom")} *
                        </label>
                        <input
                          type="date"
                          name="rentalPeriod.from"
                          value={formData.rentalPeriod.from}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("periodTo")} *
                        </label>
                        <input
                          type="date"
                          name="rentalPeriod.to"
                          value={formData.rentalPeriod.to}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("rent")} ({t("thb")}) *
                      </label>
                      <input
                        type="number"
                        name="rent"
                        value={formData.rent}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">{t("discount")}</h4>

                      {formData.discounts.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {formData.discounts.map((discount, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-gray-700">
                                  {discount.description}
                                </span>
                              </div>
                              <div className="text-gray-600">
                                ฿{discount.amount.toLocaleString()}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDiscount(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder={t("discountDescription")}
                            value={discountsInput.description}
                            onChange={(e) =>
                              setDiscountsInput((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder={tp("amount")}
                            value={
                              discountsInput.amount === 0
                                ? ""
                                : discountsInput.amount
                            }
                            onChange={(e) =>
                              setDiscountsInput((prev) => ({
                                ...prev,
                                amount:
                                  e.target.value === ""
                                    ? 0
                                    : parseFloat(e.target.value) || 0,
                              }))
                            }
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addDiscount}
                          disabled={
                            !discountsInput.description.trim() ||
                            discountsInput.amount <= 0
                          }
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {tc("add")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("utilities")}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">{t("electricity")}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("startMeter")}
                            {isFieldAutoFilled("electricity.startMeter") && (
                              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Auto-filled
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            name="electricity.startMeter"
                            value={formData.electricity.startMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={getInputClassName(
                              "electricity.startMeter",
                              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("endMeter")}
                          </label>
                          <input
                            type="number"
                            name="electricity.endMeter"
                            value={formData.electricity.endMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("rate")} ({t("thb")}/{t("electricityUnit")})
                          </label>
                          <input
                            type="number"
                            name="electricity.rate"
                            value={formData.electricity.rate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("meterFee")} ({t("thb")})
                          </label>
                          <input
                            type="number"
                            name="electricity.meterFee"
                            value={formData.electricity.meterFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">{t("water")}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("startMeter")}
                            {isFieldAutoFilled("water.startMeter") && (
                              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                Auto-filled
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            name="water.startMeter"
                            value={formData.water.startMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={getInputClassName(
                              "water.startMeter",
                              "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("endMeter")}
                          </label>
                          <input
                            type="number"
                            name="water.endMeter"
                            value={formData.water.endMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("rate")} ({t("thb")}/{t("electricityUnit")})
                          </label>
                          <input
                            type="number"
                            name="water.rate"
                            value={formData.water.rate}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("meterFee")} ({t("thb")})
                          </label>
                          <input
                            type="number"
                            name="water.meterFee"
                            value={formData.water.meterFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">{t("otherFees")}</h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("airconFee")} ({t("thb")})
                          </label>
                          <input
                            type="number"
                            name="airconFee"
                            value={formData.airconFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("fridgeFee")} ({t("thb")})
                          </label>
                          <input
                            type="number"
                            name="fridgeFee"
                            value={formData.fridgeFee}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">
                          {t("additionalOtherFees")}
                        </h5>

                        {formData.otherFees.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {formData.otherFees.map((fee, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-md"
                              >
                                <div className="flex-1">
                                  <span className="font-medium text-gray-700">
                                    {fee.description}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  ฿{fee.amount.toLocaleString()}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeOtherFee(index)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder={tp("feeDescription")}
                              value={otherFeesInput.description}
                              onChange={(e) =>
                                setOtherFeesInput((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="w-32">
                            <input
                              type="number"
                              placeholder={tp("amount")}
                              value={otherFeesInput.amount}
                              onChange={(e) =>
                                setOtherFeesInput((prev) => ({
                                  ...prev,
                                  amount: parseFloat(e.target.value) || 0,
                                }))
                              }
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={addOtherFee}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {tc("add")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">{t("preview")}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>{t("rent")}:</span>
                      <span>฿{formData.rent.toLocaleString()}</span>
                    </div>
                    {formData.discounts.length > 0 && (
                      <div className="space-y-1">
                        {formData.discounts.map((discount, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-red-600 text-sm"
                          >
                            <span>{discount.description}:</span>
                            <span>-฿{discount.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-red-600 font-medium">
                          <span>{t("totalDiscounts")}:</span>
                          <span>
                            -฿{preview.discountsTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t("netRent")}:</span>
                      <span>฿{preview.netRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("electricity")} (
                        {(
                          formData.electricity.endMeter -
                          formData.electricity.startMeter
                        ).toFixed(1)}{" "}
                        {t("electricityUnit")}):
                      </span>
                      <span>฿{preview.electricityCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t("water")} (
                        {(
                          formData.water.endMeter - formData.water.startMeter
                        ).toFixed(1)}{" "}
                        {t("waterUnit")}):
                      </span>
                      <span>฿{preview.waterCost.toLocaleString()}</span>
                    </div>
                    {formData.airconFee > 0 && (
                      <div className="flex justify-between">
                        <span>{t("airconFee")}:</span>
                        <span>฿{formData.airconFee.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.fridgeFee > 0 && (
                      <div className="flex justify-between">
                        <span>{t("fridgeFee")}:</span>
                        <span>฿{formData.fridgeFee.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.otherFees.length > 0 && (
                      <div className="space-y-1">
                        {formData.otherFees.map((fee, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{fee.description}:</span>
                            <span>฿{fee.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {preview.otherFeesTotal > 0 && (
                      <div className="flex justify-between font-medium">
                        <span>{t("totalOtherFees")}:</span>
                        <span>฿{preview.otherFeesTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="my-3" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t("grandTotal")}:</span>
                      <span className="text-green-600">
                        ฿{preview.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? t("creating") : t("createNew")}
                  </button>
                  <Link
                    href={`/${locale}/bills`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {tc("cancel")}
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
