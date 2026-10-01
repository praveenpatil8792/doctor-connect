import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../features/auth/authAPI";
import { loginSuccess } from "../features/auth/authSlice";

import Button from "../components/common/Button";
import Input from "../components/common/Input";

export default function Login() {

    const dispatch = useDispatch();

    const navigate = useNavigate();

    const {

        register,

        handleSubmit,

        formState: { errors }

    } = useForm();

    const onSubmit = async (data) => {

        try {

            const response = await loginUser(data);

            dispatch(loginSuccess(response));

            navigate("/");

        }

        catch (error) {

            alert(

                error.response?.data?.message ||

                "Login Failed"

            );

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center bg-slate-100">

            <form

                onSubmit={handleSubmit(onSubmit)}

                className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"

            >

                <h1 className="text-3xl font-bold mb-8 text-center">

                    Login

                </h1>

                <Input

                    label="Email"

                    name="email"

                    type="email"

                    placeholder="Enter Email"

                    register={register}

                    error={errors.email}

                />

                <div className="mt-5">

                    <Input

                        label="Password"

                        name="password"

                        type="password"

                        placeholder="Enter Password"

                        register={register}

                        error={errors.password}

                    />

                </div>

                <Button

                    type="submit"

                    className="w-full mt-8"

                >

                    Login

                </Button>

                <p className="text-center mt-6">

                    Don't have an account?

                    <Link

                        to="/register"

                        className="text-blue-600 ml-2"

                    >

                        Register

                    </Link>

                </p>

            </form>

        </div>

    );

}