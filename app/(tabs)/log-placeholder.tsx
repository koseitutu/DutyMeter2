import { Redirect } from "expo-router";

// This screen exists only to occupy the tab slot for the center FAB button.
// Actual logging is done via the /log modal route.
export default function LogPlaceholder() {
  return <Redirect href="/" />;
}
