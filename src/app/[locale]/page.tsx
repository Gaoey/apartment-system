import Link from "next/link";
import { Building, FileText, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Apartment Rental Billing System
          </h1>
          <p className="text-lg text-gray-600">
            Manage apartments, rooms, tenants, and generate billing invoices
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link href="/apartments" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Manage Apartments
              </h3>
              <p className="text-gray-600">
                Create, update, and manage apartment buildings and rooms
              </p>
            </div>
          </Link>

          <Link href="/bills" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Billing Management
              </h3>
              <p className="text-gray-600">
                Generate bills, track payments, and export PDF invoices
              </p>
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Owner Settings
              </h3>
              <p className="text-gray-600">
                Configure owner information and system settings
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Quick Start Guide
            </h2>
            <ol className="text-left space-y-2 text-gray-700">
              <li>1. Set up owner information in Settings</li>
              <li>2. Create apartments and add rooms</li>
              <li>3. Generate bills for tenants</li>
              <li>4. Export PDF invoices</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
