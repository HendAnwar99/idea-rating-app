export function averageRating(ratings) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating.stars, 0) / ratings.length;
}

export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
