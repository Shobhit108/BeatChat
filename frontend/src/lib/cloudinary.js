export const getOptimizedImage = (url) => {
  if (!url || !url.includes("cloudinary")) return url;

  return url.replace(
    "/upload/",
    "/upload/w_500,q_auto:good,f_auto/"
  );
};