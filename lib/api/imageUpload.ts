import { handleResponse } from "./http";

export async function uploadImage(
    endpoint: string,
    token: string | null,
    file: File,
    fieldName: string = "photo",
): Promise<{ photoData: string; photoContentType: string }> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    return handleResponse<{ photoData: string; photoContentType: string }>(res);
}