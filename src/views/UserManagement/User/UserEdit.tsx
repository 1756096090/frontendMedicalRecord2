import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RoleController } from "../../../controllers/RoleController";
import { SpecialistController } from "../../../controllers/SpecialistController";
import { UserController } from '../../../controllers/UserController';
import { Role } from "../../../models/Role";
import { Specialist } from "../../../models/Specialist";
import { User } from "../../../models/User";

interface UserFormState extends Omit<User, 'Role' | 'Specialist' | 'BirthDate'> {
  RoleID: string;
  SpecialistID: string;
  BirthDate: string;
}

const UserEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<UserFormState>({
    ID: "",
    Email: "",
    Name: "",
    Phone: "",
    Address: "",
    Gender: "",
    DNI: "",
    Password: "",
    BirthDate: new Date().toISOString().split('T')[0],
    RoleID: "",
    SpecialistID: "",
    HasAccess: false,
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const roleController = new RoleController();
  const specialistController = new SpecialistController();
  const userController = new UserController();

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const [fetchedRoles, fetchedSpecialists] = await Promise.all([
          roleController.getRoles(),
          specialistController.getSpecialists()
        ]);

        setRoles(fetchedRoles);
        setSpecialists(fetchedSpecialists);

        if (id && id !== 'new') {
          const userData = await userController.getUser(id);
          console.log("🚀 ~ initializeData ~ userData:", userData)
          const birthDate = userData.BirthDate instanceof Date 
            ? userData.BirthDate.toISOString().split('T')[0]
            : new Date(userData.BirthDate).toISOString().split('T')[0];

          setUser({
            ID: userData.ID,
            Email: userData.Email,
            Name: userData.Name,
            Phone: userData.Phone,
            Address: userData.Address,
            Gender: userData.Gender,
            DNI: userData.DNI,
            Password: userData.Password,             
            BirthDate: birthDate,
            RoleID: userData.RoleID,
            SpecialistID: userData.SpecialistID,
            HasAccess: userData.HasAccess,
          });
        }
      } catch (error) {
        setError("Error al cargar los datos. Por favor, inténtalo de nuevo.");
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement; 
    const inputType = (e.target as HTMLInputElement).type;
    
    setUser(prev => ({
      ...prev,
      [name]: inputType === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleID = e.target.value;
    setUser(prev => ({
      ...prev,
      RoleID: selectedRoleID
    }));
  };

  const handleSpecialistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSpecialistID = e.target.value;
    setUser(prev => ({
      ...prev,
      SpecialistID: selectedSpecialistID
    }));
  };
  
  const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/; 
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  const validateFields = () => {
    const errors: string[] = [];
    if (!user.Name) errors.push("El nombre es requerido.");
    if (!user.Email) {
        errors.push("El correo electrónico es requerido.");
    } else if (!emailRegex.test(user.Email)) {
        errors.push("El formato del correo electrónico es inválido.");
    }
    if (!user.Phone) {
        errors.push("El teléfono es requerido.");
    } else if (!phoneRegex.test(user.Phone)) {
        errors.push("El formato del teléfono es inválido.");
    }
    if (!user.Address) errors.push("La dirección es requerida.");
    if (!user.Gender) errors.push("El género es requerido.");
    if (!user.DNI) errors.push("El DNI es requerido.");
    if (user.DNI.length < 10 || user.DNI.length > 13) errors.push("El DNI debe tener entre 10 y 13 dígitos.");
    if (!user.Password) errors.push("La contraseña es requerida.");
    if (!user.BirthDate) errors.push("La fecha de nacimiento es requerida.");
    if (!user.RoleID) errors.push("El rol es requerido.");
    if (!user.SpecialistID) errors.push("El especialista es requerido.");
    return errors;
};


  const handleSave = async () => {
    const errors = validateFields();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      setIsLoading(true);
      const userToSave: User = {
        ID: user.ID,
        Email: user.Email,
        Name: user.Name,
        Phone: user.Phone,
        Address: user.Address,
        Gender: user.Gender,
        DNI: user.DNI,
        Password: user.Password, 
        BirthDate: new Date(user.BirthDate),
        RoleID: user.RoleID,
        SpecialistID: user.SpecialistID,
        HasAccess: user.HasAccess,
      };

      if(id === 'new') {
        await userController.addUser(userToSave);
      } else {
        await userController.editUser(userToSave);
      }
      
      navigate("/user-management");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
        errors.push(error.message);
      setValidationErrors(errors); 
      return
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id === 'new' ? "Crear Usuario" : "Editar Usuario"}
      </h1>

      {validationErrors.length > 0 && (
        <div className="mb-4 p-2 border border-red-500 text-red-500">
          {validationErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="Name"
          placeholder="Nombre"
          value={user.Name}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="email"
          name="Email"
          placeholder="Correo Electrónico"
          value={user.Email}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="tel"
          name="Phone"
          placeholder="Teléfono"
          value={user.Phone}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="text"
          name="Address"
          placeholder="Dirección"
          value={user.Address}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <select
          name="Gender"
          value={user.Gender}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        >
          <option value="">Seleccionar Género</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <input
          type="number"
          name="DNI"
          placeholder="DNI"
          value={user.DNI}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="password"
          name="Password"
          placeholder="Contraseña"
          value={user.Password}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <input
          type="date"
          name="BirthDate"
          value={user.BirthDate}
          onChange={handleInputChange}
          className="border rounded p-2 w-full"
        />
        <select
          name="RoleID"
          value={user.RoleID}
          onChange={handleRoleChange}
          className="border rounded p-2 w-full"
        >
          <option value="">Seleccionar rol</option>
          {roles.map((role) => (
            <option key={role.ID} value={role.ID}>
              {role.Name}
            </option>
          ))}
        </select>
        <select
          name="SpecialistID"
          value={user.SpecialistID}
          onChange={handleSpecialistChange}
          className="border rounded p-2 w-full"
        >
          <option value="">Seleccionar Especialista</option>
          {specialists.map((specialist) => (
            <option key={specialist.ID} value={specialist.ID}>
              {specialist.Specialization}
            </option>
          ))}
        </select>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="HasAccess"
            checked={user.HasAccess}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label>¿Tiene Acceso?</label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
        <button
          onClick={() => navigate("/user-management")}
          className="px-4 py-2 rounded border hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default UserEdit; 
