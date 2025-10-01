import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const apiUrl = process.env.REACT_APP_API_URL || '';

const SiteAllocationManager = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [siteAllocations, setSiteAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSite, setNewSite] = useState({
    siteName: '',
    district: '',
    state: ''
  });

  // Search for user by email
  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;

      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      // First, get user details
      const userResponse = await fetch(
        `${apiUrl}/api/user/user-details?email=${searchEmail}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error('User not found');
      }

      const userDetails = await userResponse.json();
      setUserData(userDetails);

      // Then, get site allocations
      const siteResponse = await fetch(
        `${apiUrl}/api/site-allocation/user?email=${searchEmail}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (siteResponse.ok) {
        const siteData = await siteResponse.json();
        setSiteAllocations(siteData.data?.sites || []);
      } else {
        setSiteAllocations([]);
      }

      toast.success('User found successfully');
    } catch (error) {
      console.error('Error searching user:', error);
      toast.error(error.message || 'User not found');
      setUserData(null);
      setSiteAllocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new site allocation
  const addSite = async () => {
    if (!newSite.siteName.trim() || !newSite.district.trim() || !newSite.state.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;

      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${apiUrl}/api/site-allocation/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: searchEmail,
          siteName: newSite.siteName,
          district: newSite.district,
          state: newSite.state
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSiteAllocations(data.data.sites);
        setNewSite({ siteName: '', district: '', state: '' });
        setShowAddForm(false);
        toast.success('Site added successfully');
      } else {
        toast.error(data.error || 'Failed to add site');
      }
    } catch (error) {
      console.error('Error adding site:', error);
      toast.error('Failed to add site');
    }
  };

  // Remove site allocation
  const removeSite = async (siteId) => {
    if (!window.confirm('Are you sure you want to remove this site allocation?')) {
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user ? user.token : null;

      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await fetch(`${apiUrl}/api/site-allocation/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: searchEmail,
          siteId: siteId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSiteAllocations(data.data.sites);
        toast.success('Site removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove site');
      }
    } catch (error) {
      console.error('Error removing site:', error);
      toast.error('Failed to remove site');
    }
  };

  const resetSearch = () => {
    setSearchEmail('');
    setUserData(null);
    setSiteAllocations([]);
    setShowAddForm(false);
    setNewSite({ siteName: '', district: '', state: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Site Allocation Management</h2>
      
      {/* Search Section */}
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Enter user email to search"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && searchUser()}
          />
          <button
            onClick={searchUser}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {(userData || siteAllocations.length > 0) && (
            <button
              onClick={resetSearch}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* User Information */}
      {userData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="font-medium">Name:</span> {userData.fullName}</div>
            <div><span className="font-medium">Email:</span> {userData.email}</div>
            <div><span className="font-medium">Phone:</span> {userData.phoneNumber}</div>
            <div><span className="font-medium">State:</span> {userData.state}</div>
            <div><span className="font-medium">Reporting Manager:</span> {userData.reportingManager}</div>
          </div>
        </div>
      )}

      {/* Add Site Form */}
      {userData && (
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Add New Site
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">Add New Site Allocation</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <input
                  type="text"
                  value={newSite.siteName}
                  onChange={(e) => setNewSite({ ...newSite, siteName: e.target.value })}
                  placeholder="Site Name"
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newSite.district}
                  onChange={(e) => setNewSite({ ...newSite, district: e.target.value })}
                  placeholder="District"
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newSite.state}
                  onChange={(e) => setNewSite({ ...newSite, state: e.target.value })}
                  placeholder="State"
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addSite}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Add Site
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewSite({ siteName: '', district: '', state: '' });
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Site Allocations List */}
      {userData && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Allocated Sites ({siteAllocations.length})
          </h3>
          {siteAllocations.length === 0 ? (
            <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              No sites allocated to this user yet.
            </div>
          ) : (
            <div className="space-y-3">
              {siteAllocations.map((site, index) => (
                <div key={site._id || index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div><span className="font-medium text-gray-600">Site Name:</span> {site.siteName}</div>
                        <div><span className="font-medium text-gray-600">District:</span> {site.district}</div>
                        <div><span className="font-medium text-gray-600">State:</span> {site.state}</div>
                      </div>
                      {site.createdAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Added on: {new Date(site.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSite(site._id)}
                      className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SiteAllocationManager;
