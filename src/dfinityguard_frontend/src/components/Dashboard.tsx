import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../../declarations/dfinityguard_backend/dfinityguard_backend.did';
import { dfinityguard_backend } from '../../../declarations/dfinityguard_backend';
import { file_management } from '../../../declarations/file_management';
import { notes } from '../../../declarations/notes';
import { task_manager } from '../../../declarations/task_manager';
import { photo_gallery } from '../../../declarations/photo_gallery';
import FileManagement from './FileManagement';
import Notes from './Notes';
import PhotoGallery from './PhotoGallery';
import TaskManager from './TaskManager';
import Settings from './Settings';
import Calendar from './Calendar';
import ConfirmationModal from './ConfirmationModal';
import { 
  UserCircleIcon, 
  FolderIcon, 
  CogIcon, 
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon,
  CheckCircleIcon,
  CalendarDateRangeIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'files' | 'notes' | 'photos' | 'tasks' | 'calendar' | 'security' | 'settings'>('overview');
  const [fileCount, setFileCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [photoCount, setPhotoCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [storageUsage, setStorageUsage] = useState(0);
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchCounts();
  }, []);

  const fetchUserData = async () => {
    const username = localStorage.getItem('username');
    if (username) {
      try {
        const result = await dfinityguard_backend.getUser(username);
        if ('ok' in result) {
          setUser(result.ok);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      navigate('/login');
    }
  };

  const fetchCounts = async () => {
    try {
      const files = await file_management.getUserFiles();
      setFileCount(files.length);
      
      const userNotes = await notes.getUserNotes();
      setNoteCount(userNotes.length);
      
      const photos = await photo_gallery.getUserPhotos();
      setPhotoCount(photos.length);
      
      const tasks = await task_manager.getUserTasks();
      setTaskCount(tasks.length);
      
      const usage = await file_management.getUserStorageUsage();
      setStorageUsage(Number(usage));
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-500">DfinityGuard Dashboard</h1>
          <button onClick={handleLogoutClick} className="flex items-center text-yellow-500 hover:text-yellow-400">
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded shadow-lg">
          {notification}
        </div>
      )}

      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
              <UserCircleIcon className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-center mb-2">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-400 text-center">{user.email}</p>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left p-2 rounded ${activeSection === 'overview' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <PencilIcon className="h-5 w-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveSection('files')}
                className={`w-full text-left p-2 rounded ${activeSection === 'files' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <FolderIcon className="h-5 w-5 inline mr-2" />
                My Files
              </button>
              <button
                onClick={() => setActiveSection('notes')}
                className={`w-full text-left p-2 rounded ${activeSection === 'notes' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                My Notes
              </button>
              <button
                onClick={() => setActiveSection('photos')}
                className={`w-full text-left p-2 rounded ${activeSection === 'photos' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <PhotoIcon className="h-5 w-5 inline mr-2" />
                My Photos
              </button>
              <button
                onClick={() => setActiveSection('tasks')}
                className={`w-full text-left p-2 rounded ${activeSection === 'tasks' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                My Tasks
              </button>
              <button
                onClick={() => setActiveSection('calendar')}
                className={`w-full text-left p-2 rounded ${activeSection === 'calendar' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <CalendarDateRangeIcon className="h-5 w-5 inline mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setActiveSection('security')}
                className={`w-full text-left p-2 rounded ${activeSection === 'security' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                Security
              </button>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full text-left p-2 rounded ${activeSection === 'settings' ? 'bg-yellow-500 text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                <CogIcon className="h-5 w-5 inline mr-2" />
                Settings
              </button>
            </nav>
          </div>
          <div className="md:col-span-3">
            {activeSection === 'overview' && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-500">Welcome, {user.firstName}!</h2>
                <p className="text-gray-400 mb-4">Here's an overview of your DfinityGuard account:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-500">Files</h3>
                    <p className="text-2xl font-bold">{fileCount}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-500">Notes</h3>
                    <p className="text-2xl font-bold">{noteCount}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-500">Photos</h3>
                    <p className="text-2xl font-bold">{photoCount}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-500">Tasks</h3>
                    <p className="text-2xl font-bold">{taskCount}</p>
                  </div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-500">Storage Usage</h3>
                  <p className="text-gray-400 mb-2">{(storageUsage / (1024 * 1024)).toFixed(2)} MB / 100 MB</p>
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-500 h-2.5 rounded-full" 
                      style={{ width: `${(storageUsage / (100 * 1024 * 1024)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'files' && <FileManagement />}
            {activeSection === 'notes' && <Notes />}
            {activeSection === 'photos' && <PhotoGallery />}
            {activeSection === 'tasks' && <TaskManager />}
            {activeSection === 'calendar' && <Calendar />}
            {activeSection === 'security' && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-500">Security Settings</h2>
                <p className="text-gray-400">Security settings will be implemented here.</p>
              </div>
            )}
            {activeSection === 'settings' && <Settings user={user} showNotification={showNotification} />}
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        message="Are you sure you want to log out?"
      />
    </div>
  );
};

export default Dashboard;