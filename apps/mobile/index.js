// Local re-export of expo-router's entry. We use this instead of pointing
// `main` at `expo-router/entry` directly so that on Windows monorepos Expo
// CLI doesn't compute the JS entry path as `..\..\node_modules\expo-router\
// entry` — the resulting bundle URL (`http://.../..%5C..%5Cnode_modules...`)
// blows up Java's URL parser in Expo Go and the app crashes at boot.
import "expo-router/entry";
