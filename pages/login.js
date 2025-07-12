import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { auth, RecaptchaVerifier } from "../lib/firebase";
import { signInWithPhoneNumber } from "firebase/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Initialize reCAPTCHA
    const initializeRecaptcha = async () => {
      try {
        if (typeof window !== "undefined" && !window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "invisible",
              callback: () => {
                // This will be called when reCAPTCHA is solved
                console.log("reCAPTCHA verified");
              },
            }
          );
        }
      } catch (err) {
        console.error("reCAPTCHA initialization error:", err);
        setError("Failed to initialize reCAPTCHA. Please refresh the page.");
      }
    };

    initializeRecaptcha();

    // Cleanup
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const sendOTP = async () => {
    if (!phone.match(/^\d{10}$/)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const phoneNumber = `+91${phone}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setError("");
    } catch (error) {
      console.error("OTP sending error:", error);
      setError(`Failed to send OTP: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await confirmationResult.confirm(otp);
      setIsVerified(true);
      setError("");
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const finishLogin = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    // Store user data
    localStorage.setItem(
      "docreadUser",
      JSON.stringify({
        phone,
        name: name.trim(),
      })
    );

    // Redirect to reader page
    router.push("/reader");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        📘 Login to Docread
      </h2>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {!confirmationResult ? (
        <>
          <input
            type="tel"
            placeholder="Enter 10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            maxLength={10}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={sendOTP}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      ) : !isVerified ? (
        <>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={verifyOTP}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={finishLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Finish & Continue
          </button>
        </>
      )}

      {/* Hidden reCAPTCHA container */}
      <div id="recaptcha-container" style={{ display: "none" }}></div>
    </div>
  );
}
