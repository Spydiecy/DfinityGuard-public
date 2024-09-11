import React, { useState, useEffect } from 'react';
import { file_management } from '../../../declarations/file_management';
import { 
  CloudArrowUpIcon, 
  ArrowDownTrayIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

interface File {
  id: bigint;
  name: string;
  contentType: string;
  size: bigint;
}

const ITEMS_PER_PAGE = 5;

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [storageUsage, setStorageUsage] = useState<bigint>(BigInt(0));
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
    fetchStorageUsage();
  }, []);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const fileIds = await file_management.getUserFiles();
      const filePromises = fileIds.map(id => file_management.getFile(id));
      const fileResults = await Promise.all(filePromises);
      const fetchedFiles = fileResults
        .filter(result => 'ok' in result)
        .map(result => (result as any).ok);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const usage = await file_management.getUserStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error fetching storage usage:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await file_management.uploadFile(file.name, file.type, Array.from(new Uint8Array(arrayBuffer)));
      if ('ok' in result) {
        await fetchFiles();
        await fetchStorageUsage();
      } else {
        console.error('Error uploading file:', result.err);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleFileDelete = async (fileId: bigint) => {
    try {
      const result = await file_management.deleteFile(fileId);
      if ('ok' in result) {
        await fetchFiles();
        await fetchStorageUsage();
      } else {
        console.error('Error deleting file:', result.err);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileDownload = async (fileId: bigint, fileName: string, contentType: string) => {
    try {
      const result = await file_management.downloadFile(fileId);
      if ('ok' in result) {
        const blob = new Blob([new Uint8Array(result.ok)], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Error downloading file:', result.err);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const paginatedFiles = files.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex justify-center items-center h-[600px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-300"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center">
        <DocumentIcon className="h-8 w-8 mr-2 text-yellow-500" />
        My Files
      </h2>
      <div className="mb-4">
        <p className="text-white">Storage Usage: {(Number(storageUsage) / (1024 * 1024)).toFixed(2)} MB / 100 MB</p>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${(Number(storageUsage) / (100 * 1024 * 1024)) * 100}%` }}></div>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="file-upload" className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded inline-flex items-center transition duration-300">
          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
          {uploadingFile ? 'Uploading...' : 'Upload File'}
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          disabled={uploadingFile}
        />
      </div>
      <ul className="space-y-2">
        {paginatedFiles.map((file) => (
          <li key={file.id.toString()} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
            <div className="flex items-center">
              <DocumentIcon className="h-6 w-6 mr-2 text-yellow-500" />
              <div>
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-gray-400 text-sm">{(Number(file.size) / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => handleFileDownload(file.id, file.name, file.contentType)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded transition duration-300 mr-2"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleFileDelete(file.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold p-2 rounded transition duration-300"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {files.length === 0 && (
        <p className="text-gray-400 text-center mt-4">No files uploaded yet.</p>
      )}
      {files.length > ITEMS_PER_PAGE && (
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

export default FileManagement;