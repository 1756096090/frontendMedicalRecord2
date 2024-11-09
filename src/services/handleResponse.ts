// handleResponse.ts
export interface ErrorResponse {
    status: number;
    message: string;
}


export const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorResponse: ErrorResponse = { status: response.status, message: '' };
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorResponse.message = errorData.message || "Error en la respuesta del servidor";
        } else {
            const errorText = await response.text();
            errorResponse.message = errorText || "Unexpected error occurred";
        }

        throw errorResponse;
    }

    return response.json() as Promise<T>;
};
