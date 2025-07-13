// pages/index.js

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function IndexPage() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [isEmail, setIsEmail] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !contact || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = {
      name,
      email: isEmail ? contact : "",
      phone: !isEmail ? contact : "",
      password,
    };

    localStorage.setItem("user", JSON.stringify(user));
    alert("✅ Profile created!");
    router.push("/dashboard");
  };

  return (
    <div className="container">
      <h1 className="title">📘 Create Your Profile</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="switcher">
          <label>
            <input
              type="radio"
              name="contactMode"
              checked={!isEmail}
              onChange={() => setIsEmail(false)}
            />
            Use Phone
          </label>
          <label>
            <input
              type="radio"
              name="contactMode"
              checked={isEmail}
              onChange={() => setIsEmail(true)}
            />
            Use Email
          </label>
        </div>

        <input
          type={isEmail ? "email" : "tel"}
          placeholder={isEmail ? "Email Address" : "Phone Number"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Create Profile</button>
      </form>
      <div className="text-center mt-8 pt-6 border-t">
        <span>Already have an account? </span>
        <Link href="/login">
          <span className="text-blue-600 hover:underline">Login here</span>
        </Link>
      </div>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 100px auto;
          padding: 30px;
          background: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .title {
          margin-bottom: 20px;
        }

        form input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
        }

        .switcher {
          display: flex;
          justify-content: space-around;
          margin: 10px 0;
        }

        form button {
          width: 100%;
          padding: 10px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        form button:hover {
          background: #125ea6;
        }
      `}</style>
    </div>
  );
}
