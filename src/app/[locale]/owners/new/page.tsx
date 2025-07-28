'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Users, Save, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function NewOwnerPage() {
  const t = useTranslations('owners');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    taxId: '',
  });

  const validateForm = () => {
    const validationErrors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      validationErrors.push(tv('ownerNameRequired'));
      newFieldErrors.name = tv('ownerNameRequired');
    }
    if (!formData.address.trim()) {
      validationErrors.push(tv('ownerAddressRequired'));
      newFieldErrors.address = tv('ownerAddressRequired');
    }
    if (!formData.phone.trim()) {
      validationErrors.push(tv('ownerPhoneRequired'));
      newFieldErrors.phone = tv('ownerPhoneRequired');
    }
    if (!formData.taxId.trim()) {
      validationErrors.push(tv('ownerTaxIdRequired'));
      newFieldErrors.taxId = tv('ownerTaxIdRequired');
    }

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
      const response = await fetch('/api/owners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/${locale}/owners`);
      } else {
        if (data.validationErrors) {
          const validationMessages = Object.values(data.validationErrors) as string[];
          setErrors(validationMessages);
          setFieldErrors(data.validationErrors);
        } else {
          setErrors([data.error || tv('unknownErrorOccurred')]);
        }
      }
    } catch (error) {
      console.error('Error creating owner:', error);
      setErrors([tv('networkError')]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName];
  };

  const getInputClassName = (fieldName: string, baseClassName: string) => {
    const hasError = fieldErrors[fieldName];
    
    if (hasError) {
      return `${baseClassName} border-red-500 focus:border-red-500 focus:ring-red-500`;
    } else {
      return `${baseClassName} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/${locale}`} className="text-blue-600 hover:text-blue-800">
            <Home className="w-5 h-5" />
          </Link>
          <Link href={`/${locale}/owners`} className="text-blue-600 hover:text-blue-800">
            <Users className="w-5 h-5" />
          </Link>
          <span className="text-gray-400">/</span>
          <h1 className="text-3xl font-bold text-gray-900">{t('createNew')}</h1>
        </div>

        <div className="max-w-2xl mx-auto">
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">{t('ownerInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={getInputClassName('name', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                  />
                  {getFieldError('name') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('address')} *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                    className={getInputClassName('address', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                  />
                  {getFieldError('address') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('address')}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={getInputClassName('phone', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                    />
                    {getFieldError('phone') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('taxId')} *
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      required
                      className={getInputClassName('taxId', 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent')}
                    />
                    {getFieldError('taxId') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('taxId')}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
                >
                  <Save className="w-4 h-4" />
                  {loading ? t('creating') : t('createNew')}
                </button>
                <Link
                  href={`/${locale}/owners`}
                  className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors flex-1"
                >
                  <X className="w-4 h-4" />
                  {tc('cancel')}
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}