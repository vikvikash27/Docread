// pages/login.js
import { useState, useEffect } from "react";
import { auth, RecaptchaVerifier } from "../lib/firebase";
import { signInWithPhoneNumber, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA verified");
        },
      },
      auth
    );
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return alert("Enter phone number");

    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        appVerifier
      );
      setConfirmationResult(confirmation);
      alert("OTP sent!");
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return alert("Enter OTP");

    try {
      await confirmationResult.confirm(otp);
      router.push("/");
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="container">
      <h1>📲 RouteReader Login</h1>

      {!confirmationResult ? (
        <form onSubmit={sendOtp}>
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
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
          <button type="submit">Verify OTP</button>
        </form>
      )}

      <div id="recaptcha-container"></div>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 100px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
          box-shadow: 0 0 10px #eee;
          text-align: center;
        }
        input {
          width: 100%;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        button {
          width: 100%;
          padding: 12px;
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
