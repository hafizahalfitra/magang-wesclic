export interface Employee {
    id: number;
    nama: string;
    umur: number;
    pendidikan: string;
    pengalamanKerja: number;
    jabatan: string;
}

export const employeeData: Employee[] = [
    { id: 1, nama: "Andi Saputra", umur: 25, pendidikan: "S1", pengalamanKerja: 2, jabatan: "Staff" },
    { id: 2, nama: "Siti Rahma", umur: 29, pendidikan: "S1", pengalamanKerja: 4, jabatan: "HR" },
    { id: 3, nama: "Budi Pratama", umur: 32, pendidikan: "S2", pengalamanKerja: 6, jabatan: "Supervisor" },
    { id: 4, nama: "Dina Lestari", umur: 35, pendidikan: "Diploma", pengalamanKerja: 8, jabatan: "Manager" },
    { id: 5, nama: "Eko Wahyudi", umur: 24, pendidikan: "SMK", pengalamanKerja: 1, jabatan: "Junior Staff" },
    { id: 6, nama: "Fani Indah", umur: 30, pendidikan: "S1", pengalamanKerja: 5, jabatan: "Analyst" },
    { id: 7, nama: "Guntur Wijaya", umur: 40, pendidikan: "S2", pengalamanKerja: 12, jabatan: "Senior Manager" },
    { id: 8, nama: "Hana Melani", umur: 27, pendidikan: "S1", pengalamanKerja: 3, jabatan: "Staff" },
    { id: 9, nama: "Irfan Hakim", umur: 33, pendidikan: "Diploma", pengalamanKerja: 7, jabatan: "Team Leader" },
    { id: 10, nama: "Joko Susilo", umur: 45, pendidikan: "S3", pengalamanKerja: 18, jabatan: "Director" },
    { id: 11, nama: "Karin Putri", umur: 26, pendidikan: "S1", pengalamanKerja: 2, jabatan: "Marketing" },
    { id: 12, nama: "Lia Amanda", umur: 28, pendidikan: "S1", pengalamanKerja: 4, jabatan: "Finance" },
    { id: 13, nama: "Muhammad Ridwan", umur: 38, pendidikan: "S2", pengalamanKerja: 10, jabatan: "Head of IT" },
    { id: 14, nama: "Nisa Chairunnisa", umur: 23, pendidikan: "SMK", pengalamanKerja: 1, jabatan: "Admin" },
    { id: 15, nama: "Oscar Pratama", umur: 36, pendidikan: "S1", pengalamanKerja: 9, jabatan: "Project Manager" }
];