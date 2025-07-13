'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Home, Building } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Apartment {
  _id: string;
  name: string;
  address: string;
  phone: string;
  taxId: string;
  createdAt: string;
}

export default function ApartmentsPage() {
  const t = useTranslations('apartments');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments');
      const data = await response.json();
      if (data.success) {
        setApartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteApartment = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    
    try {
      const response = await fetch(`/api/apartments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setApartments(apartments.filter(apt => apt._id !== id));
      }
    } catch (error) {
      console.error('Error deleting apartment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">{tc('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5" />
            </Link>
            <Building className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          </div>
          <Link
            href={`/${locale}/apartments/new`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addNew')}
          </Link>
        </div>

        {apartments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noApartments')}</h3>
            <p className="text-gray-600 mb-4">{t('noApartmentsDesc')}</p>
            <Link
              href={`/${locale}/apartments/new`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('createNew')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {apartments.map((apartment) => (
              <div key={apartment._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{apartment.name}</h3>
                    <div className="space-y-1 text-gray-600">
                      <p><span className="font-medium">{t('address')}:</span> {apartment.address}</p>
                      <p><span className="font-medium">{t('phone')}:</span> {apartment.phone}</p>
                      <p><span className="font-medium">{t('taxId')}:</span> {apartment.taxId}</p>
                      <p><span className="font-medium">{tc('created')}:</span> {new Date(apartment.createdAt).toLocaleDateString(locale)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/${locale}/apartments/${apartment._id}/rooms`}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                    >
                      <Building className="w-3 h-3" />
                      {t('manageRooms')}
                    </Link>
                    <Link
                      href={`/${locale}/apartments/${apartment._id}/edit`}
                      className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      {tc('edit')}
                    </Link>
                    <button
                      onClick={() => deleteApartment(apartment._id)}
                      className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {tc('delete')}
                    </button>
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