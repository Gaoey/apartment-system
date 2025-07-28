'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Users, Plus, Edit, Trash2, Building } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Owner {
  _id: string;
  name: string;
  address: string;
  phone: string;
  taxId: string;
  apartments: Array<{
    _id: string;
    name: string;
  }>;
  createdAt: string;
}

export default function OwnersPage() {
  const t = useTranslations('owners');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners?populate=apartments');
      const data = await response.json();
      if (data.success) {
        setOwners(data.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t('deleteConfirm')} "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/owners/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setOwners(owners.filter(owner => owner._id !== id));
      } else {
        alert(data.error || 'Failed to delete owner');
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
      alert('Failed to delete owner');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale);
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
            <Users className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          </div>
          <Link
            href={`/${locale}/owners/new`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addNew')}
          </Link>
        </div>

        {owners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noOwners')}</h3>
            <p className="text-gray-600 mb-4">{t('noOwnersDesc')}</p>
            <Link
              href={`/${locale}/owners/new`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('addNew')}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {owners.map((owner) => (
              <div key={owner._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {owner.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">{t('address')}:</span>
                        <p className="mt-1">{owner.address}</p>
                      </div>
                      <div>
                        <span className="font-medium">{t('phone')}:</span> {owner.phone}
                      </div>
                      <div>
                        <span className="font-medium">{t('taxId')}:</span> {owner.taxId}
                      </div>
                    </div>
                  </div>
                </div>

                {owner.apartments.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {t('apartments')} ({owner.apartments.length})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {owner.apartments.map((apartment) => (
                        <div key={apartment._id} className="text-sm text-blue-700">
                          {apartment.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  {tc('created')}: {formatDate(owner.createdAt)}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/owners/${owner._id}/edit`}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors flex-1 justify-center"
                  >
                    <Edit className="w-3 h-3" />
                    {tc('edit')}
                  </Link>
                  <button
                    onClick={() => handleDelete(owner._id, owner.name)}
                    disabled={deletingId === owner._id || owner.apartments.length > 0}
                    className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex-1 justify-center"
                    title={owner.apartments.length > 0 ? t('cannotDeleteWithApartments') : ''}
                  >
                    <Trash2 className="w-3 h-3" />
                    {deletingId === owner._id ? tc('deleting') : tc('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}