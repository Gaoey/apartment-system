'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Building, Save, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function EditApartmentPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const t = useTranslations('apartments');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [apartmentId, setApartmentId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    taxId: '',
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setApartmentId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (apartmentId) {
      fetchApartment();
    }
  }, [apartmentId]);

  const fetchApartment = async () => {
    try {
      const response = await fetch(`/api/apartments/${apartmentId}`);
      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.data.name,
          address: data.data.address,
          phone: data.data.phone,
          taxId: data.data.taxId,
        });
      }
    } catch (error) {
      console.error('Error fetching apartment:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/apartments/${apartmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/apartments`);
      } else {
        alert('Error updating apartment: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating apartment:', error);
      alert('Error updating apartment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (fetchLoading) {
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
          <Link href={`/${locale}/apartments`} className="text-blue-600 hover:text-blue-800">
            <Building className="w-5 h-5" />
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-3xl font-bold text-gray-900">{t('editApartment')}</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter apartment name"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('address')} *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('taxId')} *
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    required
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? t('updating') : t('editApartment')}
                </button>
                <Link
                  href={`/${locale}/apartments`}
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {tc('cancel')}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}