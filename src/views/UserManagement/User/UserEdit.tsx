import React, { useState, useEffect } from "react";
import { RoleController } from "../../../controllers/RoleController";
import { Role } from "../../../models/Role";
import { Specialist } from "../../../models/Specialist";
import { RoleUser, SpecialistUser } from "../../../models/User";
import { SpecialistController } from "../../../controllers/SpecialistController";

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
  role: string | null; // Cambiado a string
  specialist: string | null; // Cambiado a string
};

const UserEdit: React.FC = () => {
  const [user, setUser] = useState<User>({
    email: "",
    name: "",
    phone: "",
    address: "",
    gender: "",
    dni: "",
    password: "",
    birthDate: "",
    role: null,
    specialist: null,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const roleController = new RoleController();
  const specialistController = new SpecialistController();

  useEffect(() => {
    // Fetch roles and specialists from the server
    fetchRoles();
    fetchSpecialists();
  }, []);

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await roleController.getRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const fetchedSpecialists = await specialistController.getSpecialists();
      setSpecialists(fetchedSpecialists);
    } catch (error) {
      console.error("Error fetching specialists:", error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `/api/users${user.id ? `/${user.id}` : ""}`,
        {
          method: user.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      if (response.ok) {
        // Redirect to the user management page
        window.location.href = "/user-management";
      } else {
        console.error("Error saving user:", await response.json());
      }
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleReturn = () => {
    // Redirect to the user management page
    window.location.href = "/user-management";
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        {user.id ? "Edit User" : "Create User"}
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
          value={user.role || ""}
          onChange={(e) =>
            setUser({
              ...user,
              role: e.target.value || null, // Solo almacena el ID
            })
          }
          className="border p-2 mr-2"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.ID} value={role.ID}>
              {role.Name}
            </option>
          ))}
        </select>
        <select value={user.specialist || ""}
        onChange={(e) =>
          setUser({
            ...user,
            role: e.target.value || null, // Solo almacena el ID
          })
        }
         className="border p-2 mr-2">
          <option value="">Select Specialist</option>
          {specialists.map((specialist) => (
            <option key={specialist.ID} value={specialist.ID}>
              {" "}
              {/* Asegúrate de que specialist.ID es único */}
              {specialist.Specialization}
            </option>
          ))}
        </select>
        <button onClick={handleSave} className="bg-blue-500 text-white p-2">
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
