import { supabase } from "../lib/supabase";
export default function FaceIDLogin() {
  async function loginWithFaceID() {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorType: "webauthn",
    });
    if (error) { alert("FaceID login failed: " + error.message); return; }
    alert("Logged in with FaceID!");
  }
  return (<button onClick={loginWithFaceID}>Login with FaceID</button>);
}
