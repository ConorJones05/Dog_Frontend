'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Dog {
    id: string;
    name: string;
    image: string;
    breed: string;
    price: number;
}

export default function Home() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const router = useRouter();

    // Get unique breeds from dogs data
    useEffect(() => {
        const fetchBreeds = async () => {
            try {
                const response = await fetch('https://backend-dog-a7fu.onrender.com/dogs');
                if (response.ok) {
                    const data = await response.json();
                    const uniqueBreeds = Array.from(new Set(data.dogs.map((dog: Dog) => dog.breed)));
                    setBreeds(uniqueBreeds as string[]);
                }
            } catch (err) {
                console.error('Error fetching breeds:', err);
            }
        };

        fetchBreeds();
    }, []);

    useEffect(() => {
        const fetchDogs = async () => {
            try {
                setLoading(true);
                let url = `https://backend-dog-a7fu.onrender.com/dogs?page=${page}`;
                
                // Add breed filters
                if (selectedBreeds.length > 0) {
                    selectedBreeds.forEach(breed => {
                        url += `&breed=${encodeURIComponent(breed)}`;
                    });
                }

                if (priceRange.min) url += `&min_price=${priceRange.min}`;
                if (priceRange.max) url += `&max_price=${priceRange.max}`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch dogs');
                }
                
                const data = await response.json();
                setDogs(data.dogs);
            } catch (err) {
                setError('Error loading dogs. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDogs();
    }, [page, selectedBreeds]);

    const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedBreeds(options);
        setPage(1); // Reset to first page when filters change
    };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        setPriceRange(prev => ({ ...prev, [type]: value }));
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleBreed = (breed: string) => {
        setSelectedBreeds(prev => 
            prev.includes(breed) 
                ? prev.filter(b => b !== breed) 
                : [...prev, breed]
        );
        setPage(1); 
    };

    return (
        <main className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold">Dog Adoption Center</h1>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                            Login
                        </Link>
                    </div>
                </header>

                {/* Filter Section */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Filter Dogs</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="w-full md:w-64 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Breed
                            </label>
                            <button 
                                type="button"
                                className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <span>{selectedBreeds.length ? `${selectedBreeds.length} selected` : 'Select breeds'}</span>
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {dropdownOpen && (
                                <div className="absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-auto">
                                    {breeds.map(breed => (
                                        <div key={breed} className="flex items-center px-3 py-2 hover:bg-gray-100">
                                            <input
                                                type="checkbox"
                                                id={`breed-${breed}`}
                                                checked={selectedBreeds.includes(breed)}
                                                onChange={() => toggleBreed(breed)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label 
                                                htmlFor={`breed-${breed}`}
                                                className="ml-2 block text-sm text-gray-900 w-full cursor-pointer"
                                            >
                                                {breed}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center">
                            <div className="relative h-16 w-16 animate-spin">
                                <Image 
                                    src="/vercel.svg"
                                    alt="Loading"
                                    width={64}
                                    height={64}
                                    className="text-blue-600 animate-pulse"
                                />
                            </div>
                            <p className="mt-2 text-blue-500 font-medium">Loading dogs...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {dogs.map((dog) => (
                                <div 
                                    key={dog.id} 
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                                    onClick={() => router.push(`/dogs/${dog.id}`)}
                                >
                                    <div className="relative h-56 w-full">
                                        <Image
                                            src={dog.image}
                                            alt={dog.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h2 className="text-xl font-bold">{dog.name}</h2>
                                        <p className="text-gray-600">{dog.breed}</p>
                                        <p className="text-green-600 font-semibold mt-2">${dog.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                onClick={handlePrevPage}
                                disabled={page <= 1}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">Page {page}</span>
                            <button
                                onClick={handleNextPage}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}