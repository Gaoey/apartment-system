'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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

export default function NewBillPage() {
  const t = useTranslations('bill');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');
  const tp = useTranslations('placeholder');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedApartmentId, setSelectedApartmentId] = useState(searchParams.get('apartmentId') || '');
  const [formData, setFormData] = useState({
    apartmentId: searchParams.get('apartmentId') || '',
    roomId: searchParams.get('roomId') || '',
    billingDate: new Date().toISOString().split('T')[0],
    tenantName: '',
    tenantAddress: '',
    tenantPhone: '',
    tenantTaxId: '',
    rentalPeriod: {
      from: '',
      to: '',
    },
    rent: 0,
    discount: 0,
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
    description: '',
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

    if (!formData.apartmentId) validationErrors.push(tv('pleaseSelectApartment'));
    if (!formData.roomId) validationErrors.push(tv('pleaseSelectRoom'));
    if (!formData.tenantName.trim()) validationErrors.push(tv('tenantNameRequired'));
    if (!formData.tenantAddress.trim()) validationErrors.push(tv('tenantAddressRequired'));
    if (!formData.tenantPhone.trim()) validationErrors.push(tv('tenantPhoneRequired'));
    if (!formData.tenantTaxId.trim()) validationErrors.push(tv('tenantTaxIdRequired'));
    if (!formData.rentalPeriod.from) validationErrors.push(tv('rentalPeriodFromRequired'));
    if (!formData.rentalPeriod.to) validationErrors.push(tv('rentalPeriodToRequired'));
    if (formData.rent <= 0) validationErrors.push(tv('rentMustBeGreaterThanZero'));
    
    if (formData.rentalPeriod.from && formData.rentalPeriod.to) {
      const fromDate = new Date(formData.rentalPeriod.from);
      const toDate = new Date(formData.rentalPeriod.to);
      if (fromDate >= toDate) {
        validationErrors.push(tv('rentalPeriodFromMustBeBeforeTo'));
      }
    }

    if (formData.electricity.endMeter < formData.electricity.startMeter) {
      validationErrors.push(tv('electricityEndMeterMustBeGreaterOrEqual'));
    }

    if (formData.water.endMeter < formData.water.startMeter) {
      validationErrors.push(tv('waterEndMeterMustBeGreaterOrEqual'));
    }

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

    try {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/bills`);
      } else {
        setErrors([data.error || tv('unknownErrorOccurred')]);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      setErrors([tv('networkError')]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'number' ? parseFloat(value) || 0 : value;

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

  const calculatePreview = () => {
    const netRent = formData.rent - formData.discount;
    const electricityCost = (formData.electricity.endMeter - formData.electricity.startMeter) * formData.electricity.rate + formData.electricity.meterFee;
    const waterCost = (formData.water.endMeter - formData.water.startMeter) * formData.water.rate + formData.water.meterFee;
    const otherFeesTotal = formData.otherFees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = netRent + electricityCost + waterCost + formData.airconFee + formData.fridgeFee + otherFeesTotal;

    return { netRent, electricityCost, waterCost, otherFeesTotal, grandTotal };
  };

  const preview = calculatePreview();

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
          <h1 className="text-3xl font-bold text-gray-900">{t('createNew')}</h1>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">{t('selectApartment')}</option>
                        {apartments.map((apt) => (
                          <option key={apt._id} value={apt._id}>{apt.name}</option>
                        ))}
                      </select>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">{t('selectRoom')}</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>Room {room.roomNumber}</option>
                        ))}
                      </select>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
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
                    <div className="grid md:grid-cols-2 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('discount')} ({t('thb')})
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <h4 className="font-medium mb-3">{t('water')}</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('startMeter')}
                          </label>
                          <input
                            type="number"
                            name="water.startMeter"
                            value={formData.water.startMeter}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('endMeter')}
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
                            {t('rate')} ({t('thb')}/{t('electricityUnit')})
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
                            {t('meterFee')} ({t('thb')})
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
                      <h4 className="font-medium mb-3">{t('otherFees')}</h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('airconFee')} ({t('thb')})
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
                            {t('fridgeFee')} ({t('thb')})
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
                        <h5 className="font-medium mb-3">{t('additionalOtherFees')}</h5>
                        
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
                    {formData.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>{t('discount')}:</span>
                        <span>-฿{formData.discount.toLocaleString()}</span>
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
                    <div className="flex justify-between">
                      <span>{t('water')} ({(formData.water.endMeter - formData.water.startMeter).toFixed(1)} {t('waterUnit')}):</span>
                      <span>฿{preview.waterCost.toLocaleString()}</span>
                    </div>
                    {formData.airconFee > 0 && (
                      <div className="flex justify-between">
                        <span>{t('airconFee')}:</span>
                        <span>฿{formData.airconFee.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.fridgeFee > 0 && (
                      <div className="flex justify-between">
                        <span>{t('fridgeFee')}:</span>
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
                    {loading ? t('creating') : t('createNew')}
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