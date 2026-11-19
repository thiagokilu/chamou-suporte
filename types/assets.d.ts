declare module "*.png" {
  const image: import("next/dist/shared/lib/image-external").StaticImageData;
  export default image;
}
