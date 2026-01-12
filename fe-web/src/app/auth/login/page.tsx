"use client";

import "./index.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RootState, useAppDispatch, useAppSelector } from "@/redux/store";
import { loginUser } from "@/redux/async-thunk/auth-async";

export default function Login() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: RootState) => state.user);
    const [form, setForm] = useState({
        usernameOrEmail: "",
        password: "",
    });

    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        dispatch(loginUser({ email: form.usernameOrEmail, password: form.password }));
    };

    useEffect(() => {
        if (user?.accessToken) return router.push("/dashboard");
    }, [user?.accessToken]);

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* Floating Header */}
                <div className="login-floating-header">
                    <h2>Welcome back</h2>
                    <p>Please sign in to your account</p>
                </div>

                {/* Form */}
                <form className="login-card" onSubmit={handleSubmit}>
                    {/* {error && <div className="login-error">{error}</div>} */}

                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={form.usernameOrEmail}
                        onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                        required
                    />

                    {/* PASSWORD + SHOW PASS */}
                    <input
                        type={showPass ? "text" : "password"}
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                    />

                    <div className="show-pass-row">
                        <label className="show-password" htmlFor="showPassLogin">
                            Show password?
                        </label>
                        <input
                            type="checkbox"
                            id="showPassLogin"
                            checked={showPass}
                            onChange={() => setShowPass(!showPass)}
                        />
                    </div>

                    <button
                        className="btn-submit"
                        // disabled={loading}
                    >
                        {/* {loading ? "Signing in..." : "SIGN IN"} */}
                        LOGIN
                    </button>

                    <p className="login-footer">
                        Don't have an account?{" "}
                        <Link className="link" href="/auth/sign-up">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
