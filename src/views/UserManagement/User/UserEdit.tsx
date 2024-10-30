import React, { useState, useEffect } from 'react';

type User = {
  id?: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  gender: string;
  dni: string;
  password: string;
  birthDate: string;
  role: Role | null;
  specialist: Specialist | null;
};

type Role = {
  id: string;
  name: string;
};

type Specialist = {
  id: string;
  name: string;
};

const UserEdit: React.FC = () => {
  const [user, setUser] = useState<User>({
    email: '',
    name: '',
    phone: '',
    address: '',
    gender: '',
    dni: '',
    password: '',
    birthDate: '',
    role: null,
    specialist: null,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  useEffect(() => {
    // Fetch roles and specialists from the server
    fetchRoles();
    fetchSpecialists();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const response = await fetch('/api/specialists');
      const data = await response.json();
      setSpecialists(data);
    } catch (error) {
      console.error('Error fetching specialists:', error);
    }
  };

  const handleSave = async () => {
    try {
      let response;
      if (user.id) {
        // Update existing user
        response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
      } else {
        // Create new user
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
      }
      if (response.ok) {
        // Redirect to the user management page
        window.location.href = '/user-management';
      } else {
        console.error('Error saving user:', await response.json());
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleReturn = () => {
    // Redirect to the user management page
    window.location.href = '/user-management';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        {user.id ? 'Edit User' : 'Create User'}
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Phone"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Address"
          value={user.address}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Gender"
          value={user.gender}
          onChange={(e) => setUser({ ...user, gender: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="DNI"
          value={user.dni}
          onChange={(e) => setUser({ ...user, dni: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="border p-2 mr-2"
        />
        <input
          type="date"
          placeholder="Birth Date"
          value={user.birthDate}
          onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={user.role?.id || ''}
          onChange={(e) =>
            setUser({
              ...user,
              role: roles.find((r) => r.id === e.target.value) || null,
            })
          }
          className="border p-2 mr-2"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <select
          value={user.specialist?.id || ''}
          onChange={(e) =>
            setUser({
              ...user,
              specialist: specialists.find((s) => s.id === e.target.value) || null,
            })
          }
          className="border p-2 mr-2"
        >
          <option value="">Select Specialist</option>
          {specialists.map((specialist) => (
            <option key={specialist.id} value={specialist.id}>
              {specialist.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2"
        >
          Save
        </button>
      </div>
      <button
        onClick={handleReturn}
        className="text-black p-3 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300"
      >
        Return
      </button>
    </div>
  );
};

export default UserEdit;