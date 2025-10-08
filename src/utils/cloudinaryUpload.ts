export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const url = `https://api.cloudinary.com/v1_1/dx1vy3nro/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    const res = await fetch(url, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    return data.secure_url;
};
