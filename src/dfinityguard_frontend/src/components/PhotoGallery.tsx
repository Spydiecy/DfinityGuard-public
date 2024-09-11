import React, { useState, useEffect } from 'react';
import { photo_gallery } from '../../../declarations/photo_gallery';
import { 
  CloudArrowUpIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Photo {
  id: bigint;
  name: string;
  contentType: string;
  data: number[] | Uint8Array;
  createdAt: bigint;
}

const ITEMS_PER_PAGE = 12;
const MAX_STORAGE_PER_USER = 100 * 1024 * 1024; // 100 MB in bytes

const PhotoGallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [storageUsage, setStorageUsage] = useState<bigint>(BigInt(0));

  useEffect(() => {
    fetchPhotos();
    fetchStorageUsage();
  }, []);

  const fetchPhotos = async () => {
    try {
      const fetchedPhotos = await photo_gallery.getUserPhotos();
      setPhotos(fetchedPhotos as Photo[]);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const usage = await photo_gallery.getUserStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (Number(storageUsage) + file.size > MAX_STORAGE_PER_USER) {
      alert("Storage limit exceeded. Please delete some photos before uploading more.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await photo_gallery.uploadPhoto(file.name, file.type, Array.from(new Uint8Array(arrayBuffer)));
      if ('ok' in result) {
        await fetchPhotos();
        await fetchStorageUsage();
      } else {
        console.error('Error uploading photo:', result.err);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async (photoId: bigint) => {
    try {
      const result = await photo_gallery.deletePhoto(photoId);
      if ('ok' in result) {
        await fetchPhotos();
        await fetchStorageUsage();
      } else {
        console.error('Error deleting photo:', result.err);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handlePhotoDownload = (photo: Photo) => {
    const blob = new Blob([new Uint8Array(Array.isArray(photo.data) ? photo.data : Array.from(photo.data))], { type: photo.contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = photo.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);
  const paginatedPhotos = photos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center">
        <PhotoIcon className="h-8 w-8 mr-2 text-yellow-500" />
        My Photos
      </h2>
      <div className="mb-4">
        <p className="text-white">Storage Usage: {(Number(storageUsage) / (1024 * 1024)).toFixed(2)} MB / 100 MB</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div 
            className="bg-yellow-500 h-2.5 rounded-full" 
            style={{ width: `${(Number(storageUsage) / MAX_STORAGE_PER_USER) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="photo-upload" className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded inline-flex items-center transition duration-300">
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={uploadingPhoto}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedPhotos.map((photo) => (
          <div key={photo.id.toString()} className="relative group">
            <img
              src={`data:${photo.contentType};base64,${btoa(String.fromCharCode.apply(null, Array.isArray(photo.data) ? photo.data : Array.from(photo.data)))}`}
              alt={photo.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => handlePhotoDownload(photo)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded transition duration-300 mr-2"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handlePhotoDelete(photo.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded transition duration-300"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {photos.length === 0 && (
        <p className="text-gray-400 text-center mt-4">No photos uploaded yet.</p>
      )}
      {photos.length > ITEMS_PER_PAGE && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded disabled:opacity-50 transition duration-300"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded disabled:opacity-50 transition duration-300"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;