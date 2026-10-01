import { useEffect, useState } from "react";
import DoctorCard from "./DoctorCard";
import { getAllDoctors } from "../../services/doctorService";

export default function RelatedDoctors({

    specialization,

    currentDoctorId

}) {

    const [doctors, setDoctors] = useState([]);

    useEffect(() => {

        fetchDoctors();

    }, [specialization]);

    const fetchDoctors = async () => {

        try {

            const data = await getAllDoctors({

                specialization,

                limit:4

            });

            const filtered = data.doctors.filter(

                doctor => doctor._id !== currentDoctorId

            );

            setDoctors(filtered);

        }

        catch(error){

            console.log(error);

        }

    };

    if(doctors.length===0){

        return null;

    }

    return(

        <div className="mt-20">

            <h2 className="text-3xl font-bold mb-8">

                Related Doctors

            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

                {

                    doctors.map(doctor=>(

                        <DoctorCard

                            key={doctor._id}

                            doctor={doctor}

                        />

                    ))

                }

            </div>

        </div>

    );

}