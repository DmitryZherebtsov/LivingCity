export function getErrorMessage(err, fallback = "Wystąpił błąd. Spróbuj ponownie.") {
  return err?.response?.data?.message || err?.response?.data?.error || fallback;
}
