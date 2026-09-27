import { supabase } from "../lib/supabase";
export default function FaceIDRegister() {
  async function registerPasskey() {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "webauthn",
      friendlyName: "iPhone FaceID",
    });
    if (error) { alert("FaceID setup failed: " + error.message); return; }
    alert("FaceID registered!");
  }
  return (<button onClick={registerPasskey}>Register FaceID</button>);
}
