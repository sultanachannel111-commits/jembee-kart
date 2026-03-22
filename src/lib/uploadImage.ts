export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {

    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = (e: any) => {
      img.src = e.target.result;
    };

    img.onload = () => {

      const maxWidth = 800;
      const scale = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.7
      );
    };

  });
};
