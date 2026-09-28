export function hapticTap() {
  if ("vibrate" in navigator) navigator.vibrate(30);
}
export function hapticSuccess() {
  if ("vibrate" in navigator) navigator.vibrate([20, 40, 20]);
}
export function hapticError() {
  if ("vibrate" in navigator) navigator.vibrate([60, 30, 60]);
}
