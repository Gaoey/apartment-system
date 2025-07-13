'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, FileText, Save, X } from 'lucide-react';

interface Apartment {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  roomNumber: string;
}

export default function NewBillPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
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
    otherFees: 0,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        router.push('/bills');
      } else {
        alert('Error creating bill: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Error creating bill');
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

  const calculatePreview = () => {
    const netRent = formData.rent - formData.discount;
    const electricityCost = (formData.electricity.endMeter - formData.electricity.startMeter) * formData.electricity.rate + formData.electricity.meterFee;
    const waterCost = (formData.water.endMeter - formData.water.startMeter) * formData.water.rate + formData.water.meterFee;
    const grandTotal = netRent + electricityCost + waterCost + formData.airconFee + formData.fridgeFee + formData.otherFees;

    return { netRent, electricityCost, waterCost, grandTotal };
  };

  const preview = calculatePreview();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            <Home className="w-5 h-5" />
          </Link>
          <Link href="/bills" className="text-blue-600 hover:text-blue-800">
            <FileText className="w-5 h-5" />
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-3xl font-bold text-gray-900">Create New Bill</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment *
                      </label>
                      <select
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={handleApartmentChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select apartment</option>
                        {apartments.map((apt) => (
                          <option key={apt._id} value={apt._id}>{apt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room *
                      </label>
                      <select
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        required
                        disabled={!selectedApartmentId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select room</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>Room {room.roomNumber}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Date *
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
                  <h3 className="text-lg font-semibold mb-4">Tenant Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tenant Name *
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
                        Address *
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
                          Phone *
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
                          Tax ID *
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
                  <h3 className="text-lg font-semibold mb-4">Rental Period & Charges</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Period From *
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
                          Period To *
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
                          Rent (THB) *
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
                          Discount (THB)
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
                  <h3 className="text-lg font-semibold mb-4">Utilities</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Electricity</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Meter
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
                            End Meter
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
                            Rate (THB/unit)
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
                            Meter Fee (THB)
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
                      <h4 className="font-medium mb-3">Water</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Meter
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
                            End Meter
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
                            Rate (THB/unit)
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
                            Meter Fee (THB)
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
                      <h4 className="font-medium mb-3">Other Fees</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aircon Fee (THB)
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
                            Fridge Fee (THB)
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
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Fees (THB)
                          </label>
                          <input
                            type="number"
                            name="otherFees"
                            value={formData.otherFees}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h3 className="text-lg font-semibold mb-4">Bill Preview</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Rent:</span>
                      <span>฿{formData.rent.toLocaleString()}</span>
                    </div>
                    {formData.discount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-฿{formData.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Net Rent:</span>
                      <span>฿{preview.netRent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electricity ({(formData.electricity.endMeter - formData.electricity.startMeter).toFixed(1)} units):</span>
                      <span>฿{preview.electricityCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water ({(formData.water.endMeter - formData.water.startMeter).toFixed(1)} units):</span>
                      <span>฿{preview.waterCost.toLocaleString()}</span>
                    </div>
                    {formData.airconFee > 0 && (
                      <div className="flex justify-between">
                        <span>Aircon Fee:</span>
                        <span>฿{formData.airconFee.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.fridgeFee > 0 && (
                      <div className="flex justify-between">
                        <span>Fridge Fee:</span>
                        <span>฿{formData.fridgeFee.toLocaleString()}</span>
                      </div>
                    )}
                    {formData.otherFees > 0 && (
                      <div className="flex justify-between">
                        <span>Other Fees:</span>
                        <span>฿{formData.otherFees.toLocaleString()}</span>
                      </div>
                    )}
                    <hr className="my-3" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Grand Total:</span>
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
                    {loading ? 'Creating...' : 'Create Bill'}
                  </button>
                  <Link
                    href="/bills"
                    className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
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