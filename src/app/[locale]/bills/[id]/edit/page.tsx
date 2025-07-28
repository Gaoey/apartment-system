'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, FileText, Save, X, Plus, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Apartment {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
}

export default function EditBillPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const t = useTranslations('bill');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const tp = useTranslations('placeholder');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [billId, setBillId] = useState<string>('');
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [formData, setFormData] = useState({
    apartmentId: '',
    roomId: '',
    billingDate: new Date().toISOString().split('T')[0],
    paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tenantName: '',
    tenantAddress: '',
    tenantPhone: '',
    tenantTaxId: '',
    rentalPeriod: {
      from: '',
      to: '',
    },
    rent: 0,
    discounts: [] as { description: string; amount: number }[],
    electricity: {
      startMeter: 0,
      endMeter: 0,
      rate: 7,
      meterFee: 50,
    },
    customUtilities: [] as { name: string; startMeter?: number; endMeter?: number; rate?: number; meterFee?: number; fixedAmount?: number }[],
    otherFees: [] as { description: string; amount: number }[],
  });
  
  const [otherFeesInput, setOtherFeesInput] = useState({
    description: '',
    amount: 0,
  });
  
  const [discountsInput, setDiscountsInput] = useState({
    description: '',
    amount: 0,
  });
  
  const [customUtilitiesInput, setCustomUtilitiesInput] = useState({
    name: '',
    startMeter: 0,
    endMeter: 0,
    rate: 0,
    meterFee: 0,
    fixedAmount: 0,
    isFixedAmount: false,
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setBillId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    if (billId) {
      fetchBillData();
    }
  }, [billId]);

  useEffect(() => {
    if (selectedApartmentId) {
      fetchRooms(selectedApartmentId);
    } else {
      setRooms([]);
    }
  }, [selectedApartmentId]);

  const fetchBillData = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      const data = await response.json();
      if (data.success) {
        const bill = data.data;
        setFormData({
          apartmentId: bill.apartmentId._id,
          roomId: bill.roomId._id,
          billingDate: bill.billingDate.split('T')[0],
          paymentDueDate: bill.paymentDueDate ? bill.paymentDueDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tenantName: bill.tenantName,
          tenantAddress: bill.tenantAddress,
          tenantPhone: bill.tenantPhone,
          tenantTaxId: bill.tenantTaxId,
          rentalPeriod: {
            from: bill.rentalPeriod.from.split('T')[0],
            to: bill.rentalPeriod.to.split('T')[0],
          },
          rent: bill.rent,
          discounts: bill.discounts || [],
          electricity: bill.electricity,
          customUtilities: bill.customUtilities || [],
          otherFees: bill.otherFees || [],
        });
        setSelectedApartmentId(bill.apartmentId._id);
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments');
      const data = await response.json();
      if (data.success) {
        setApartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
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
      console.error('Error fetching rooms:', error);
    }
  };


  const validateForm = () => {
    const validationErrors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!formData.apartmentId) {
      validationErrors.push(tv('pleaseSelectApartment'));
      newFieldErrors.apartmentId = tv('pleaseSelectApartment');
    }
    if (!formData.roomId) {
      validationErrors.push(tv('pleaseSelectRoom'));
      newFieldErrors.roomId = tv('pleaseSelectRoom');
    }
    if (!formData.tenantName.trim()) {
      validationErrors.push(tv('tenantNameRequired'));
      newFieldErrors.tenantName = tv('tenantNameRequired');
    }
    if (!formData.tenantAddress.trim()) {
      validationErrors.push(tv('tenantAddressRequired'));
      newFieldErrors.tenantAddress = tv('tenantAddressRequired');
    }
    if (!formData.tenantPhone.trim()) {
      validationErrors.push(tv('tenantPhoneRequired'));
      newFieldErrors.tenantPhone = tv('tenantPhoneRequired');
    }
    if (!formData.tenantTaxId.trim()) {
      validationErrors.push(tv('tenantTaxIdRequired'));
      newFieldErrors.tenantTaxId = tv('tenantTaxIdRequired');
    }
    if (!formData.rentalPeriod.from) {
      validationErrors.push(tv('rentalPeriodFromRequired'));
      newFieldErrors['rentalPeriod.from'] = tv('rentalPeriodFromRequired');
    }
    if (!formData.rentalPeriod.to) {
      validationErrors.push(tv('rentalPeriodToRequired'));
      newFieldErrors['rentalPeriod.to'] = tv('rentalPeriodToRequired');
    }
    if (formData.rent <= 0) {
      validationErrors.push(tv('rentMustBeGreaterThanZero'));
      newFieldErrors.rent = tv('rentMustBeGreaterThanZero');
    }
    
    if (formData.rentalPeriod.from && formData.rentalPeriod.to) {
      const fromDate = new Date(formData.rentalPeriod.from);
      const toDate = new Date(formData.rentalPeriod.to);
      if (fromDate >= toDate) {
        validationErrors.push(tv('rentalPeriodFromMustBeBeforeTo'));
        newFieldErrors['rentalPeriod.to'] = tv('rentalPeriodFromMustBeBeforeTo');
      }
    }

    if (formData.electricity.endMeter < formData.electricity.startMeter) {
      validationErrors.push(tv('electricityEndMeterMustBeGreaterOrEqual'));
      newFieldErrors['electricity.endMeter'] = tv('electricityEndMeterMustBeGreaterOrEqual');
    }

    // Validate custom utilities meters
    formData.customUtilities.forEach((utility, index) => {
      if (utility.startMeter !== undefined && utility.endMeter !== undefined && utility.endMeter < utility.startMeter) {
        validationErrors.push(`${utility.name}: End meter must be greater than or equal to start meter`);
        newFieldErrors[`customUtilities.${index}.endMeter`] = `End meter must be greater than or equal to start meter`;
      }
    });

    setFieldErrors(newFieldErrors);
    setErrors(validationErrors);
    return validationErrors.length === 0;
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
      console.log('Updating bill data:', formData);
      
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/bills/${billId}`);
      } else {
        console.error('API Error:', data);
        
        // Handle validation errors
        if (data.validationErrors) {
          const validationMessages = Object.values(data.validationErrors) as string[];
          setErrors(validationMessages);
        } else {
          setErrors([data.error || data.details || tv('unknownErrorOccurred')]);
        }
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      setErrors([tv('networkError')]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'number' ? parseFloat(value) || 0 : value;

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev as Record<string, unknown>)[parent] as Record<string, unknown>),
          [child]: actualValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: actualValue,
      }));
    }
  };

  const handleApartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const apartmentId = e.target.value;
    setSelectedApartmentId(apartmentId);
    setFormData(prev => ({
      ...prev,
      apartmentId,
      roomId: '',
    }));
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName];
  };

  const getInputClassName = (fieldName: string, baseClassName: string) => {
    const hasError = fieldErrors[fieldName];
    return `${baseClassName} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`;
  };

  const addOtherFee = () => {
    if (otherFeesInput.description.trim() && otherFeesInput.amount > 0) {
      setFormData(prev => ({
        ...prev,
        otherFees: [...prev.otherFees, { ...otherFeesInput }],
      }));
      setOtherFeesInput({ description: '', amount: 0 });
    }
  };

  const removeOtherFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherFees: prev.otherFees.filter((_, i) => i !== index),
    }));
  };

  const addDiscount = () => {
    if (discountsInput.description.trim() && discountsInput.amount > 0) {
      setFormData(prev => ({
        ...prev,
        discounts: [...prev.discounts, { ...discountsInput }],
      }));
      setDiscountsInput({ description: '', amount: 0 });
    }
  };

  const removeDiscount = (index: number) => {
    setFormData(prev => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }));
  };

  const addCustomUtility = () => {
    if (customUtilitiesInput.name.trim()) {
      const newUtility: { name: string; startMeter?: number; endMeter?: number; rate?: number; meterFee?: number; fixedAmount?: number } = {
        name: customUtilitiesInput.name,
      };
      
      if (customUtilitiesInput.isFixedAmount) {
        newUtility.fixedAmount = customUtilitiesInput.fixedAmount;
      } else {
        newUtility.startMeter = customUtilitiesInput.startMeter;
        newUtility.endMeter = customUtilitiesInput.endMeter;
        newUtility.rate = customUtilitiesInput.rate;
        newUtility.meterFee = customUtilitiesInput.meterFee;
      }
      
      setFormData(prev => ({
        ...prev,
        customUtilities: [...prev.customUtilities, newUtility],
      }));
      setCustomUtilitiesInput({
        name: '',
        startMeter: 0,
        endMeter: 0,
        rate: 0,
        meterFee: 0,
        fixedAmount: 0,
        isFixedAmount: false,
      });
    }
  };

  const removeCustomUtility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customUtilities: prev.customUtilities.filter((_, i) => i !== index),
    }));
  };

  const calculatePreview = () => {
    const discountsTotal = formData.discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const netRent = formData.rent - discountsTotal;
    const electricityCost = (formData.electricity.endMeter - formData.electricity.startMeter) * formData.electricity.rate + formData.electricity.meterFee;
    
    const customUtilitiesCost = formData.customUtilities.reduce((sum, utility) => {
      if (utility.fixedAmount !== undefined) {
        return sum + utility.fixedAmount;
      } else if (utility.startMeter !== undefined && utility.endMeter !== undefined && utility.rate !== undefined) {
        return sum + (utility.endMeter - utility.startMeter) * utility.rate + (utility.meterFee || 0);
      }
      return sum;
    }, 0);
    
    const otherFeesTotal = formData.otherFees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = netRent + electricityCost + customUtilitiesCost + otherFeesTotal;

    return { netRent, electricityCost, customUtilitiesCost, otherFeesTotal, grandTotal, discountsTotal };
  };

  const preview = calculatePreview();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{tc('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-800">
            <Home className="w-5 h-5" />
          </Link>
          <Link href={`/${locale}/bills`} className="text-blue-600 hover:text-blue-800">
            <FileText className="w-5 h-5" />
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-3xl font-bold text-gray-900">{t('editBill')}</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-red-800 font-medium mb-2">{tv('fixFollowingErrors')}</h4>
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
                  <h3 className="text-lg font-semibold mb-4">{t('basicInfo')}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('apartment')} *
                      </label>
                      <select
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={handleApartmentChange}
                        required
                        className={getInputClassName('apartmentId', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                      >
                        <option value="">{t('selectApartment')}</option>
                        {apartments.map((apt) => (
                          <option key={apt._id} value={apt._id}>{apt.name}</option>
                        ))}
                      </select>
                      {getFieldError('apartmentId') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('apartmentId')}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('room')} *
                      </label>
                      <select
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        required
                        disabled={!selectedApartmentId}
                        className={getInputClassName('roomId', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-100')}
                      >
                        <option value="">{t('selectRoom')}</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>Room {room.roomNumber}</option>
                        ))}
                      </select>
                      {getFieldError('roomId') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('roomId')}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('billingDate')} *
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
                        {t('paymentDueDate')} *
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
                  <h3 className="text-lg font-semibold mb-4">{t('tenantInfo')}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tenantName')} *
                      </label>
                      <input
                        type="text"
                        name="tenantName"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        className={getInputClassName('tenantName', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                      />
                      {getFieldError('tenantName') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('tenantName')}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('tenantAddress')} *
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
                          {t('tenantPhone')} *
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
                          {t('tenantTaxId')} *
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
                  <h3 className="text-lg font-semibold mb-4">{t('rentalPeriodAndCharges')}</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('periodFrom')} *
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
                          {t('periodTo')} *
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('rent')} ({t('thb')}) *
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
                      <h4 className="font-medium mb-3">{t('discounts')}</h4>
                      {formData.discounts.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {formData.discounts.map((discount, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                              <div className="flex-1">
                                <span className="font-medium text-gray-700">{discount.description}</span>
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
                            placeholder={tp('discountDescription')}
                            value={discountsInput.description}
                            onChange={(e) => setDiscountsInput(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            placeholder={tp('amount')}
                            value={discountsInput.amount}
                            onChange={(e) => setDiscountsInput(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addDiscount}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {tc('add')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">{t('utilities')}</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">{t('electricity')}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('startMeter')}
                          </label>
                          <input
                            type="number"
                            name="electricity.startMeter"
                            value={formData.electricity.startMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className={getInputClassName('electricity.startMeter', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('endMeter')}
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
                            {t('rate')} ({t('thb')}/{t('electricityUnit')})
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
                            {t('meterFee')} ({t('thb')})
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
                      <h4 className="font-medium mb-3">{t('customUtilities')}</h4>
                      {formData.customUtilities.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {formData.customUtilities.map((utility, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-medium text-gray-700">{utility.name}</h6>
                                <button
                                  type="button"
                                  onClick={() => removeCustomUtility(index)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              {utility.fixedAmount !== undefined ? (
                                <div className="text-sm text-gray-600">
                                  Fixed amount: ฿{utility.fixedAmount.toLocaleString()}
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                  <div>Start: {utility.startMeter}</div>
                                  <div>End: {utility.endMeter}</div>
                                  <div>Rate: ฿{utility.rate}</div>
                                  <div>Fee: ฿{utility.meterFee || 0}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-4 p-4 bg-blue-50 rounded-md">
                        <div>
                          <input
                            type="text"
                            placeholder="Utility name (e.g., Water, Air Conditioning)"
                            value={customUtilitiesInput.name}
                            onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={customUtilitiesInput.isFixedAmount}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, isFixedAmount: e.target.checked }))}
                              className="mr-2"
                            />
                            Fixed amount
                          </label>
                        </div>
                        
                        {customUtilitiesInput.isFixedAmount ? (
                          <div>
                            <input
                              type="number"
                              placeholder="Fixed amount"
                              value={customUtilitiesInput.fixedAmount}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, fixedAmount: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <input
                              type="number"
                              placeholder="Start meter"
                              value={customUtilitiesInput.startMeter}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, startMeter: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              placeholder="End meter"
                              value={customUtilitiesInput.endMeter}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, endMeter: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              placeholder="Rate per unit"
                              value={customUtilitiesInput.rate}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="number"
                              placeholder="Meter fee"
                              value={customUtilitiesInput.meterFee}
                              onChange={(e) => setCustomUtilitiesInput(prev => ({ ...prev, meterFee: parseFloat(e.target.value) || 0 }))}
                              min="0"
                              step="0.01"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={addCustomUtility}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Custom Utility
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="border-t pt-4">
                        <h5 className="font-medium mb-3">{t('otherFees')}</h5>
                        
                        {formData.otherFees.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {formData.otherFees.map((fee, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-700">{fee.description}</span>
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
                              placeholder={tp('feeDescription')}
                              value={otherFeesInput.description}
                              onChange={(e) => setOtherFeesInput(prev => ({ ...prev, description: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="w-32">
                            <input
                              type="number"
                              placeholder={tp('amount')}
                              value={otherFeesInput.amount}
                              onChange={(e) => setOtherFeesInput(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
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
                            {tc('add')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">{t('preview')}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>{t('rent')}:</span>
                      <span>฿{formData.rent.toLocaleString()}</span>
                    </div>
                    {formData.discounts.length > 0 && (
                      <div className="space-y-1">
                        {formData.discounts.map((discount, index) => (
                          <div key={index} className="flex justify-between text-red-600 text-sm">
                            <span>{discount.description}:</span>
                            <span>-฿{discount.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {preview.discountsTotal > 0 && (
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>{t('totalDiscounts')}:</span>
                        <span>-฿{preview.discountsTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t('netRent')}:</span>
                      <span>฿{preview.netRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('electricity')} ({(formData.electricity.endMeter - formData.electricity.startMeter).toFixed(1)} {t('electricityUnit')}):</span>
                      <span>฿{preview.electricityCost.toLocaleString()}</span>
                    </div>
                    {formData.customUtilities.length > 0 && (
                      <div className="space-y-1">
                        {formData.customUtilities.map((utility, index) => {
                          let cost = 0;
                          if (utility.fixedAmount !== undefined) {
                            cost = utility.fixedAmount;
                          } else if (utility.startMeter !== undefined && utility.endMeter !== undefined && utility.rate !== undefined) {
                            cost = (utility.endMeter - utility.startMeter) * utility.rate + (utility.meterFee || 0);
                          }
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{utility.name}:</span>
                              <span>฿{cost.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {preview.customUtilitiesCost > 0 && (
                      <div className="flex justify-between font-medium">
                        <span>{t('totalCustomUtilities')}:</span>
                        <span>฿{preview.customUtilitiesCost.toLocaleString()}</span>
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
                        <span>{t('totalOtherFees')}:</span>
                        <span>฿{preview.otherFeesTotal.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="my-3" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{t('grandTotal')}:</span>
                      <span className="text-green-600">฿{preview.grandTotal.toLocaleString()}</span>
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
                    {loading ? t('updating') : t('editBill')}
                  </button>
                  <Link
                    href={`/${locale}/bills`}
                    className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {tc('cancel')}
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