"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function FaceIDLogin() {
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  // Step 1 — Send login email
  async function handleLogin() {
    setStatus("Sending login email...");

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }
    });

    if (error) {
      setStatus("Login failed: " + error.message);
      return;
    }

    setStatus("Login email sent. Check your inbox.");
  }

  // Step 2 — Start MFA challenge (FaceID / TOTP / WebAuthn)
  async function startChallenge() {
    setStatus("Starting MFA challenge...");

    // Get user's factors
    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError || !factorsData?.factors?.length) {
      setStatus("No MFA factors found.");
      return;
    }

    // Pick the first factor (FaceID/WebAuthn/TOTP)
    const factor = factorsData.factors[0];
    setFactorId(factor.id);

    // IMPORTANT:
    // Supabase removed `factorType` — you ONLY pass factorId now.
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId: factor.id
      });

    if (challengeError) {
      setStatus("Challenge failed: " + challengeError.message);
      return;
    }

    setChallengeId(challengeData.id);
    setStatus("Challenge started. Waiting for verification...");
  }

  // Step 3 — Verify MFA challenge
  async function verifyChallenge(code: string) {
    if (!challengeId || !factorId) {
      setStatus("Missing challenge or factor.");
      return;
    }

    setStatus("Verifying challenge...");

    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    });

    if (error) {
      setStatus("Verification failed: " + error.message);
      return;
    }

    setStatus("MFA verified! Logged in.");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Face ID Login</h2>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, width: "100%", marginBottom: 10 }}
      />

