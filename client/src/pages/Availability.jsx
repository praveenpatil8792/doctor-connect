import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getAvailability,
    updateAvailability,
} from "../services/doctorService";

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function Availability() {

    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            const data = await getAvailability();
            setAvailability(data.availability);
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (index, field, value) => {
        const updated = [...availability];
        updated[index][field] = value;
        setAvailability(updated);
    };

    const save = async () => {
        try {
            await updateAvailability(availability);
            alert("Availability Updated");
        } catch (err) {
            alert("Error");
        }
    };

    return (
        <MainLayout>

            <div className="max-w-5xl mx-auto py-10">

                <h1 className="text-3xl font-bold mb-8">
                    Doctor Availability
                </h1>

                {availability.map((slot, index) => (

                    <div
                        key={index}
                        className="grid grid-cols-4 gap-4 mb-4"
                    >

                        <select
                            value={slot.day}
                            onChange={(e) =>
                                handleChange(
                                    index,
                                    "day",
                                    e.target.value
                                )
                            }
                            className="border p-2 rounded"
                        >

                            {days.map((day) => (
                                <option key={day}>
                                    {day}
                                </option>
                            ))}

                        </select>

                        <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                                handleChange(
                                    index,
                                    "startTime",
                                    e.target.value
                                )
                            }
                            className="border p-2 rounded"
                        />

                        <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                                handleChange(
                                    index,
                                    "endTime",
                                    e.target.value
                                )
                            }
                            className="border p-2 rounded"
                        />

                    </div>

                ))}

                <button
                    onClick={save}
                    className="bg-blue-600 text-white px-6 py-3 rounded"
                >
                    Save
                </button>

            </div>

        </MainLayout>
    );
}