'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, Building, Plus, Trash2, DoorOpen } from 'lucide-react';

interface Apartment {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  apartmentId: string;
  roomNumber: string;
  createdAt: string;
}

export default function RoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);
  const [apartmentId, setApartmentId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setApartmentId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (apartmentId) {
      fetchApartmentAndRooms();
    }
  }, [apartmentId]);

  const fetchApartmentAndRooms = async () => {
    try {
      const [apartmentRes, roomsRes] = await Promise.all([
        fetch(`/api/apartments/${apartmentId}`),
        fetch(`/api/rooms?apartmentId=${apartmentId}`)
      ]);
      
      const apartmentData = await apartmentRes.json();
      const roomsData = await roomsRes.json();
      
      if (apartmentData.success) {
        setApartment(apartmentData.data);
      }
      if (roomsData.success) {
        setRooms(roomsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) return;
    
    setAddingRoom(true);
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId: apartmentId,
          roomNumber: newRoomNumber,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRooms([...rooms, data.data]);
        setNewRoomNumber('');
        setShowAddForm(false);
      } else {
        alert('Error adding room: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Error adding room');
    } finally {
      setAddingRoom(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setRooms(rooms.filter(room => room._id !== roomId));
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5" />
            </Link>
            <Link href="/apartments" className="text-blue-600 hover:text-blue-800">
              <Building className="w-5 h-5" />
            </Link>
            <span className="text-gray-400">/</span>
            <DoorOpen className="w-6 h-6 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              {apartment?.name} - Rooms
            </h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Room</h3>
            <form onSubmit={addRoom} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  id="roomNumber"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 101, A1, etc."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={addingRoom}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingRoom ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewRoomNumber('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <DoorOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms yet</h3>
            <p className="text-gray-600 mb-4">Add rooms to this apartment to start managing tenants and billing</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Room
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DoorOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
                      <p className="text-sm text-gray-600">Created: {new Date(room.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/bills/new?apartmentId=${apartmentId}&roomId=${room._id}`}
                    className="flex-1 text-center bg-green-100 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-200 transition-colors"
                  >
                    Create Bill
                  </Link>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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