import { uploadImage } from "./imageUpload";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export function uploadTestimonialPhoto(token: string | null, file: File) {
    return uploadImage(`${API_BASE_URL}/api/admin/marketing/testimonials/photo`, token, file);
}