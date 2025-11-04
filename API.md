# API Documentation

## Authentication

Semua endpoint yang memerlukan autentikasi menggunakan NextAuth.js session. User harus login terlebih dahulu.

## Endpoints

### Auth Endpoints

#### POST `/api/register`
Registrasi akun guru baru

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required)",
  "nip": "string (optional, unique)"
}
```

**Response:**
```json
{
  "message": "Akun berhasil dibuat",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "nip": "string"
  }
}
```

### Subject Endpoints

#### GET `/api/subjects`
Ambil semua mata pelajaran milik guru yang login

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "teacherId": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime",
    "_count": {
      "students": number
    }
  }
]
```

#### POST `/api/subjects`
Buat mata pelajaran baru

**Request Body:**
```json
{
  "name": "string (required)"
}
```

### Student Endpoints

#### POST `/api/students`
Tambah siswa baru ke mata pelajaran

**Request Body:**
```json
{
  "name": "string (required)",
  "nis": "string (optional)",
  "className": "string (optional)",
  "subjectId": "string (required)"
}
```

### Grade Endpoints

#### POST `/api/grades`
Simpan atau update nilai siswa

**Request Body:**
```json
{
  "studentId": "string (required)",
  "tugas": "number (optional)",
  "ulangan": "number (optional)"
}
```

**Note:** Rata-rata dihitung otomatis jika kedua nilai tersedia.

### Export Endpoints

#### GET `/api/export?subjectId={id}`
Export nilai siswa ke Excel

**Query Parameters:**
- `subjectId`: ID mata pelajaran

**Response:** File Excel (.xlsx)

## Error Codes

- `400` - Bad Request (data tidak valid)
- `401` - Unauthorized (belum login)
- `404` - Not Found (resource tidak ditemukan)
- `500` - Internal Server Error

## Rate Limiting

Tidak ada rate limiting untuk development. Untuk production, pertimbangkan implementasi rate limiting.

## CORS

API hanya menerima request dari domain yang sama (same-origin policy).