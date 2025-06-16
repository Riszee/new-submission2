export const showFormattedDate = (date) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('id-ID', options);
};

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
