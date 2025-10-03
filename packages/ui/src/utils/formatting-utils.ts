export const formatSeconds = (fullSeconds: number): string => {
  fullSeconds = Math.trunc(fullSeconds);
  const minutes = Math.trunc(fullSeconds / 60);
  const seconds = fullSeconds - (minutes * 60);
  return (minutes > 9 ? minutes : ("0" + minutes)) + ":" + (seconds > 9 ? seconds : "0" + seconds);
}
