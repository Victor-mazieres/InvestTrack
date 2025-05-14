import React, { useState, useRef, useEffect } from "react";

export default function EmailVerificationModal({ onVerified, onClose }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleSendCode = async () => {
    setError("");
    setIsResending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/auth/send-verification-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email }),
        }
      );
      if (res.ok) {
        if (sent) setCode(["", "", "", "", "", ""]);
        setSent(true);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        const data = await res.json();
        setError(data.message || "Erreur lors de l'envoi du code");
      }
    } catch {
      setError("Erreur réseau lors de l'envoi du code");
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (i, v) => {
    if (v !== "" && !/^\d$/.test(v)) return;
    setError("");
    const c = [...code];
    c[i] = v;
    setCode(c);
    if (v && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && code[i] === "" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const txt = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6,}/.test(txt)) {
      const digs = txt.slice(0, 6).split("");
      setCode(digs);
      inputRefs.current[Math.min(digs.length, 5)]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    if (isVerifying) return;
    setError("");
    setIsVerifying(true);

    try {
      const fullCode = code.join("");
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, code: fullCode }),
      });

      if (res.ok) {
        // on affiche le message de succès
        setSuccess(true);
        localStorage.setItem("emailVerified", "true");
        // on attend 3 s, puis on ferme et on prévient le parent
        setTimeout(() => {
          onVerified();
          onClose();
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Code invalide");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Erreur réseau lors de la vérification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-gray-800 rounded-3xl p-6 w-11/12 max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {!sent ? (
          <>
            <h2 className="text-lg font-semibold text-center mb-4 text-gray-100">
              Entrez votre adresse e-mail pour vérifier votre compte
            </h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              className="w-full p-2 border border-gray-600 rounded-2xl mb-4 text-center bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && (
              <p className="text-red-500 text-center mb-2">{error}</p>
            )}
            <div className="flex justify-center">
              <button
                onClick={handleSendCode}
                disabled={isResending || !email}
                className="w-1/2 bg-greenLight text-white py-2 rounded-xl font-bold hover:bg-checkgreen transition shadow-2xl disabled:opacity-50"
              >
                {isResending ? "Envoi..." : "Envoyer le code"}
              </button>
            </div>
          </>
        ) : success ? (
          <div className="text-center text-green-400 text-lg">
            ✔️ Email vérifié !
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center mb-4 text-gray-100">
              Un code à 6 chiffres a été envoyé à {email}
            </h2>
            <div className="flex justify-between mb-6">
              {code.map((d, i) => (
                <div
                  key={i}
                  className="w-12 h-14 flex items-center justify-center"
                >
                  <input
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    maxLength="1"
                    value={d}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-10 h-14 border-2 border-gray-500 rounded-lg text-center text-xl font-bold bg-gray-700 text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            <button
              onClick={handleVerifyCode}
              disabled={code.some((d) => d === "") || isVerifying}
              className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-checkgreen transition disabled:opacity-50"
            >
              {isVerifying ? "Vérification..." : "Vérifier"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
