"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface Dog {
  id: number;
  name: string;
  image: string;
  breed: string;
  price: number;
}

interface Statistics {
  total_dogs: number;
  unique_breeds: number;
  breed_distribution: Record<string, number>;
  total_inventory_value: number;
  average_price: number;
}

export default function AdminDashboard() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newDog, setNewDog] = useState<Omit<Dog, 'id'>>({
    name: '',
    image: '',
    breed: '',
    price: 0
  });

  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://backend-dog-a7fu.onrender.com/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDogs(data.dogs || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://backend-dog-a7fu.onrender.com/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDog),
      });

      if (!response.ok) {
        throw new Error('Failed to create dog');
      }

      setNewDog({ name: '', image: '', breed: '', price: 0 });
      setIsAdding(false);
      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add dog');
    }
  };

  const handleUpdateDog = async (id: number, updatedDog: Partial<Dog>) => {
    try {
      const response = await fetch('https://backend-dog-a7fu.onrender.com/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updatedDog }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dog');
      }

      setIsEditing(null);
      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update dog');
    }
  };

  const handleDeleteDog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dog?')) return;
    
    try {
      const response = await fetch('https://backend-dog-a7fu.onrender.com/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete dog');
      }

      fetchDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete dog');
    }
  };

  const handleLogout = () => {
    // Implement your logout logic here
    router.push('/login');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dog Admin Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button className="ml-2" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {statistics && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded shadow">
              <div className="text-gray-500">Total Dogs</div>
              <div className="text-2xl">{statistics.total_dogs}</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-gray-500">Unique Breeds</div>
              <div className="text-2xl">{statistics.unique_breeds}</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-gray-500">Total Value</div>
              <div className="text-2xl">${statistics.total_inventory_value.toFixed(2)}</div>
            </div>
            <div className="bg-white p-3 rounded shadow">
              <div className="text-gray-500">Average Price</div>
              <div className="text-2xl">${statistics.average_price.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          {isAdding ? 'Cancel' : 'Add New Dog'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Add New Dog</h3>
          <form onSubmit={handleCreateDog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newDog.name}
                onChange={(e) => setNewDog({...newDog, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={newDog.image}
                onChange={(e) => setNewDog({...newDog, image: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
              <input
                type="text"
                value={newDog.breed}
                onChange={(e) => setNewDog({...newDog, breed: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                value={newDog.price}
                onChange={(e) => setNewDog({...newDog, price: Number(e.target.value)})}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save Dog
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Name</th>
              <th className="py-2 px-4 border-b text-left">Image</th>
              <th className="py-2 px-4 border-b text-left">Breed</th>
              <th className="py-2 px-4 border-b text-left">Price</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map((dog) => (
              <tr key={dog.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b">
                  {isEditing === dog.id ? (
                    <input 
                      value={dogs.find(d => d.id === dog.id)?.name || ''} 
                      onChange={(e) => {
                        setDogs(dogs.map(d => d.id === dog.id ? {...d, name: e.target.value} : d));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    dog.name
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {isEditing === dog.id ? (
                    <input 
                      value={dogs.find(d => d.id === dog.id)?.image || ''} 
                      onChange={(e) => {
                        setDogs(dogs.map(d => d.id === dog.id ? {...d, image: e.target.value} : d));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    <img src={dog.image} alt={dog.name} className="w-20 h-20 object-cover rounded" />
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {isEditing === dog.id ? (
                    <input 
                      value={dogs.find(d => d.id === dog.id)?.breed || ''} 
                      onChange={(e) => {
                        setDogs(dogs.map(d => d.id === dog.id ? {...d, breed: e.target.value} : d));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    dog.breed
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {isEditing === dog.id ? (
                    <input 
                      type="number"
                      value={dogs.find(d => d.id === dog.id)?.price || 0} 
                      onChange={(e) => {
                        setDogs(dogs.map(d => d.id === dog.id ? {...d, price: Number(e.target.value)} : d));
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  ) : (
                    `$${dog.price.toFixed(2)}`
                  )}
                </td>
                <td className="py-2 px-4 border-b">
                  {isEditing === dog.id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          const updatedDog = dogs.find(d => d.id === dog.id);
                          if (updatedDog) {
                            handleUpdateDog(dog.id, updatedDog);
                          }
                        }}
                        className="bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setIsEditing(dog.id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDog(dog.id)}
                        className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {dogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No dogs found. Add a dog to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}