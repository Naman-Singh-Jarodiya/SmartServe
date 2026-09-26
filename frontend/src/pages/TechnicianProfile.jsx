import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function TechnicianProfile() {
    const [profile, setProfile] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const getProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await api.get(
                    "/technicians/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setProfile(res.data);
            } catch (err) {
                setMessage(
                    err.response?.data?.message ||
                    "Failed to load profile"
                );
            }
        };

        getProfile();
    }, []);

    if (message) {
        return <p>{message}</p>;
    }

    if (!profile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="ss-page">
            <h1>My Profile</h1>

            <h2>{profile.name}</h2>
            <p>Email: {profile.email}</p>
            <p>Role: TECHNICIAN</p>

            <h3>Services I Can Repair</h3>

            {profile.services.map((service) => (
                <div key={service.service_id}>
                    <p>
                        {service.service} -{" "}
                        {service.experience_years} years
                    </p>
                </div>
            ))}

            <hr />

            <button onClick={() => navigate("/addresses")}>
                Manage My Addresses
            </button>

            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
        </div>
    );
}

export default TechnicianProfile;