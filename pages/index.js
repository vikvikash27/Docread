// pages/index.js

import { useState } from "react";
import { useRouter } from "next/router";
import { auth, setupRecaptcha, signInWithPhoneNumber } from "../lib/firebase";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const router = useRouter();

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!phone) return alert("Enter your phone number");

    try {
      const appVerifier = setupRecaptcha("recaptcha-container");
      const result = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        appVerifier
      );
      setConfirmationResult(result);
      setOtpSent(true);
    } catch (error) {
      alert("Error sending OTP: " + error.message);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || !name) return alert("Enter OTP and your name");

    try {
      await confirmationResult.confirm(otp);
      localStorage.setItem("user", JSON.stringify({ name, phone }));
      router.push("/dashboard");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="login-container">
      <h1>📘 RouteReader Login</h1>

      {!otpSent ? (
        <form onSubmit={sendOtp}>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div id="recaptcha-container"></div>
          <button type="submit">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Verify OTP & Login</button>
        </form>
      )}

      <style jsx>{`
        .login-container {
          max-width: 400px;
          margin: 100px auto;
          padding: 20px;
          text-align: center;
          background: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 0 10px #ddd;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        button {
          width: 100%;
          padding: 10px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background: #125ea6;
        }
      `}</style>
    </div>
  );
}
