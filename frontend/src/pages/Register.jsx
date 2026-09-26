import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [role, setRole] = useState("CUSTOMER");

    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);

    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const getServices = async () => {
            try {
                const res = await api.get("/services");
                setServices(res.data);
            } catch (err) {
                setMessage("Failed to load services");
            }
        };

        if (role === "TECHNICIAN") {
            getServices();
        }
    }, [role]);

    const handleServiceChange = (serviceId) => {
        const id = Number(serviceId);

        const exists = selectedServices.find(
            (service) => service.service_id === id
        );

        if (exists) {
            setSelectedServices(
                selectedServices.filter(
                    (service) => service.service_id !== id
                )
            );
        } else {
            setSelectedServices([
                ...selectedServices,
                {
                    service_id: id,
                    experience_years: ""
                }
            ]);
        }
    };

    const handleExperienceChange = (serviceId, value) => {
        setSelectedServices(
            selectedServices.map((service) =>
                service.service_id === serviceId
                    ? {
                          ...service,
                          experience_years: value
                      }
                    : service
            )
        );
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            if (
                role === "TECHNICIAN" &&
                selectedServices.length === 0
            ) {
                setMessage("Select at least one service");
                return;
            }

            const formattedServices = selectedServices.map(
                (service) => ({
                    service_id: service.service_id,
                    experience_years: Number(
                        service.experience_years
                    )
                })
            );

            const res = await api.post("/auth/register", {
                name,
                email,
                password,
                role,
                services:
                    role === "TECHNICIAN"
                        ? formattedServices
                        : []
            });

            setMessage(res.data.message);

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (err) {
            setMessage(
                err.response?.data?.message ||
                    "Registration failed"
            );
        }
    };

    return (
        <div className="ss-auth-page">
            <h1>SmartServe</h1>

            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) =>
                        setName(e.target.value)
                    }
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <h3>Account Type</h3>

                <label>
                    <input
                        type="radio"
                        value="CUSTOMER"
                        checked={role === "CUSTOMER"}
                        onChange={() => {
                            setRole("CUSTOMER");
                            setSelectedServices([]);
                        }}
                    />
                    Customer
                </label>

                <label>
                    <input
                        type="radio"
                        value="TECHNICIAN"
                        checked={role === "TECHNICIAN"}
                        onChange={() =>
                            setRole("TECHNICIAN")
                        }
                    />
                    Technician
                </label>

                {role === "TECHNICIAN" && (
                    <div>
                        <h3>
                            Select Services You Can Repair
                        </h3>

                        {services.length === 0 ? (
                            <p>
                                No services available.
                            </p>
                        ) : (
                            services.map((service) => {
                                const selected =
                                    selectedServices.find(
                                        (item) =>
                                            item.service_id ===
                                            service.id
                                    );

                                return (
                                    <div key={service.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={!!selected}
                                                onChange={() =>
                                                    handleServiceChange(
                                                        service.id
                                                    )
                                                }
                                            />

                                            {service.name}
                                        </label>

                                        {selected && (
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Experience in years"
                                                value={
                                                    selected.experience_years
                                                }
                                                onChange={(e) =>
                                                    handleExperienceChange(
                                                        service.id,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                <button type="submit">
                    Create Account
                </button>
            </form>

            {message && <p>{message}</p>}

            <button
                onClick={() => navigate("/login")}
            >
                Back to Login
            </button>
        </div>
    );
}

export default Register;