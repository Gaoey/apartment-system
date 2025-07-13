'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Settings, Save, User } from 'lucide-react';

interface Owner {
  _id?: string;
  name: string;
  address: string;
  phone: string;
  taxId: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [owner, setOwner] = useState<Owner>({
    name: '',
    address: '',
    phone: '',
    taxId: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOwner();
  }, []);

  const fetchOwner = async () => {
    try {
      const response = await fetch('/api/owner');
      const data = await response.json();
      if (data.success && data.data) {
        setOwner(data.data);
      }
    } catch (error) {
      console.error('Error fetching owner:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('/api/owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(owner),
      });

      const data = await response.json();
      if (data.success) {
        setOwner(data.data);
        setSuccessMessage('Owner information saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert('Error saving owner information: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving owner:', error);
      alert('Error saving owner information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOwner(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            <Home className="w-5 h-5" />
          </Link>
          <Settings className="w-6 h-6 text-gray-600" />
          <h1 className="text-3xl font-bold text-gray-900">Owner Settings</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Owner Information</h2>
            </div>
            <p className="text-gray-600 mb-6">
              This information will be used on all bills and invoices. Make sure it&apos;s accurate and up-to-date.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={owner.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter owner full name"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={owner.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={owner.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID *
                  </label>
                  <input
                    type="text"
                    id="taxId"
                    name="taxId"
                    required
                    value={owner.taxId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tax identification number"
                  />
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Owner Information'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">About Owner Settings</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Owner information appears on all generated bills and invoices</li>
              <li>• This information is required for proper tax documentation</li>
              <li>• You can update this information at any time</li>
              <li>• Changes will apply to all new bills created after saving</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}