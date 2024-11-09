// src/components/SpecialistEdit.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Specialist } from '../../../models/Specialist';
import { SpecialistController } from '../../../controllers/SpecialistController';

const SpecialistEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [specialization, setSpecialization] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [description, setDescription] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number | string>('');

    const controller = new SpecialistController();
    const navigate = useNavigate();

    useEffect(() => {
        if (id && id !== 'new') {
            controller.getSpecialist(id).then(specialist => {
                console.log("🚀 ~ controller.getSpecialist ~ specialist:", specialist)
                setSpecialization(specialist.Specialization);
                setDescription(specialist.Description);
                setYearsOfExperience(specialist.YearsOfExperience || 0);
            }).catch(error => {
                console.error("Failed to load specialist", error);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const validateFields = () => {
        const errors: string[] = [];

        if (!specialization.trim()) {
            errors.push("La especialización no puede estar vacía.");
        }
        if (!description.trim()) {
            errors.push("La descripción no puede estar vacía.");
        }
        if (yearsOfExperience === '' || Number(yearsOfExperience) < 0) {
            errors.push("Los años de experiencia deben ser un número no negativo");
        }
        return errors;
    }

    const handleSave = async () => {


        const errors = validateFields();
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        const specialist: Specialist = {
            ID: id !== 'new' ? id || '' : '',
            Specialization: specialization,
            Description: description,
            YearsOfExperience: Number(yearsOfExperience)
        };

        try {
            if (id !== 'new') {
                await controller.editSpecialist(specialist);
            } else {
                await controller.addSpecialist({
                    Specialization: specialization,
                    Description: description,
                    YearsOfExperience: Number(yearsOfExperience)
                });
            }
            navigate('/user-management');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error:any) {
           errors.push(error.message)
           console.log("🚀 ~ handleSave ~ error.message:", error)
           setValidationErrors(errors); 
           return
        }
    };


    const handleReturn = () => {
        navigate('/user-management');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{id === 'new' ? 'Crear Especialista' : 'Editar Especialista'}</h1>
            {validationErrors.length > 0 && (
                <div className="mb-4 p-2 border border-red-500 text-red-500">
                    {validationErrors.map((error, index) => (
                        <div key={index}>{error}</div>
                    ))}
                </div>
            )}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Nombre del specialización"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Descripción"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="number"
                    placeholder="Años de experiencia"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="border p-2 mr-2"
                />

                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white p-2 rounded-lg"

                >
                    Guardar
                </button>
            </div>
            <button
                onClick={handleReturn}
                className="text-black p-3 rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ease-in-out duration-300 "
            >
                Regresar
            </button>
        </div>
    );
};

export default SpecialistEdit;
