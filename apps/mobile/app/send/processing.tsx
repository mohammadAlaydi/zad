// Legacy processing screen. The new send flow does its work in
// /send/confirm and routes directly to /send/success or /send/failure —
// this route is no longer in the path. We keep a defensive redirect here
// so a stale deep link or hot-reload bounce can't ever land users on the
// old "Processing" UI (which was the source of the InstaPay-style
// "Processing + Insufficient balance" mashup).

import { Redirect } from "expo-router";

export default function SendProcessing() {
  return <Redirect href="/send" />;
}
