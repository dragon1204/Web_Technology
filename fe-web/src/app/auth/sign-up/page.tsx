"use client"

import "./index.css";
import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { registerUser, clearError } from "../redux/slices/user-slice";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  // const dispatch = useDispatch();
  const router = useRouter();

  const [form, setForm] = useState({
    user_name: "",
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

      router.push("/dashboard");
    
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">

        {/* Header */}
        <div className="register-floating-header">
          <h2>Join us today</h2>
          <p>Enter your email and password to register</p>
        </div>

        {/* Card */}
        <form className="register-card" onSubmit={handleSubmit}>
          {/* {error && <div className="register-error">{error}</div>} */}

          <input
            type="text"
            placeholder="Username"
            value={form.user_name}
            onChange={(e) =>
              setForm({ ...form, user_name: e.target.value })
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
          />

          {/* PASSWORD + SHOW PASSWORD */}
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
          />

          <div className="show-pass-row">
            <label className="show-password" htmlFor="showPassRegister">Show password?</label>
            <input
              type="checkbox"
              id="showPassRegister"
              checked={showPass}
              onChange={() => setShowPass(!showPass)}
            />
            
          </div>

          <button className="register-btn" 
            // disabled={loading}  
          >
            {/* {loading ? "Signing up..." : "SIGN UP"} */}
            SIGN UP
          </button>

          <p className="register-footer">
            Already have an account?{" "}
            <Link className="link" href="/auth/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
