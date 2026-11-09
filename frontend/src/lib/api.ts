export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

  const headers = new Headers(options.headers || {});
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Kirim dan terima cookie httpOnly
    });
  } catch (error) {
    // Tangani error jaringan (server mati, putus koneksi, CORS)
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    );
  }

  if (!response.ok) {
    let errorCode = 'REQUEST_FAILED';
    let errorMessage = `Permintaan gagal dengan status ${response.status}`;

    try {
      const data = await response.json();
      if (data && typeof data === 'object') {
        if (typeof data.code === 'string') errorCode = data.code;
        if (typeof data.message === 'string') errorMessage = data.message;
      }
    } catch {
      // Body bukan JSON, gunakan pesan default
    }

    throw new ApiError(response.status, errorCode, errorMessage);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return undefined as unknown as T;
}

