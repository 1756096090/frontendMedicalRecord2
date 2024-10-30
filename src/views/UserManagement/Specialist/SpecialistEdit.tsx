// src/components/SpecialistEdit.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Specialist } from '../../../models/Specialist';
import { SpecialistController } from '../../../controllers/SpecialistController';

const SpecialistEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [specialization, setSpecialization] = useState('');
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

    const handleSave = async () => {
        const specialist: Specialist = { ID: id !== 'new' ? id || '' : '', Specialization: specialization, Description: description, YearsOfExperience: Number(yearsOfExperience)};

        try {
            if (id !== 'new') {
                await controller.editSpecialist(specialist);
            } else {
                await controller.addSpecialist({ Specialization: specialization, Description: description, YearsOfExperience: Number(yearsOfExperience)});
            }
            navigate('/user-management');  
        } catch (error) {
            console.error("Failed to save specialist", error);
        }
    };

    const handleReturn = () => {
        navigate('/user-management');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{id === 'new' ? 'Crear Usuario' : 'Editar Usuario'}</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="text"
                    placeholder="Email"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="border p-2 mr-2"
                />

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

export default SpecialistEdit;
