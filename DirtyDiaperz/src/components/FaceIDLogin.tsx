import { supabase } from "../lib/supabase";

type FaceIDLoginProps = {
  factorId: string;
};

export default function FaceIDLogin({ factorId }: FaceIDLoginProps) {
  async function loginWithFaceID() {
    const { error } = await supabase.auth.mfa.challenge({ factorId });
    if (error) { alert("FaceID login failed: " + error.message); return; }
    alert("Logged in with FaceID!");
  }
  return (<button onClick={loginWithFaceID}>Login with FaceID</button>);
}
