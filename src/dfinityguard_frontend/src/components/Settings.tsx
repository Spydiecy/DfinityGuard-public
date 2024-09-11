import React, { useState } from 'react';
import { User } from '../../../declarations/dfinityguard_backend/dfinityguard_backend.did';
import { dfinityguard_backend } from '../../../declarations/dfinityguard_backend';

interface SettingsProps {
  user: User;
  showNotification: (message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, showNotification  }) => {
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dfinityguard_backend.updateUser(
        user.username,
        profileData.firstName,
        profileData.lastName,
        profileData.email
      );
      if ('ok' in result) {
        showNotification('Profile updated successfully');
      } else {
        showNotification(`Error updating profile: ${result.err}`);
      }
    } catch (error) {
      showNotification(`Error updating profile: ${error}`);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500">Account Settings</h2>
      {message && (
        <div className="bg-blue-500 text-white p-2 rounded mb-4">
          {message}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-yellow-500">Update Profile</h3>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
            >
              Update Profile
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-yellow-500">Change Password</h3>
          <form>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;