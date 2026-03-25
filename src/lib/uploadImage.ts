export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {

    const img = new Image();
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e: any) => {
      img.src = e.target.result;
    };

    img.onload = () => {

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const SIZE = 600; // 🔥 final size (same for all)

      canvas.width = SIZE;
      canvas.height = SIZE;

      const minSide = Math.min(img.width, img.height);

      // 🔥 center crop
      const sx = (img.width - minSide) / 2;
      const sy = (img.height - minSide) / 2;

      ctx?.drawImage(
        img,
        sx, sy,           // source start (crop)
        minSide, minSide, // source size
        0, 0,             // destination
        SIZE, SIZE        // final size
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);

          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
          });

          resolve(compressedFile);
        },
        "image/jpeg",
        0.7
      );
    };

  });
};
