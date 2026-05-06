export interface Employee {
    id: number;
    nama: string;
    divisi: string;
    jabatan: string;
    gaji?: number;
}

export const employeeData: Employee[] = [
    { id: 1, nama: "Alif Fatullah", divisi: "Executive", jabatan: "CEO", gaji: 16500000 },
    { id: 2, nama: "Saputra H", divisi: "Engineering", jabatan: "Manajer", gaji: 12000000 },
    { id: 3, nama: "Rafi Pratama", divisi: "Engineering", jabatan: "Junior", gaji: 3200000 },
    { id: 4, nama: "M Ronal", divisi: "Product & Design", jabatan: "Manajer", gaji: 10000000 },
    { id: 5, nama: "Salsabila Rahma", divisi: "Product & Design", jabatan: "Junior", gaji: 3000000 },
    { id: 6, nama: "Alzen Gifar", divisi: "Data & AI", jabatan: "Manajer", gaji: 14000000 },
    { id: 7, nama: "Fajar Mahendra", divisi: "Data & AI", jabatan: "STAF", gaji: 5000000 },
    { id: 8, nama: "Dion Gifari", divisi: "Growth & Marketing", jabatan: "SPV", gaji: 5000000 },
    { id: 9, nama: "Aldi Firmansyah", divisi: "Growth & Marketing", jabatan: "Junior", gaji: 2850000 },
    { id: 10, nama: "Ayu Vitania H", divisi: "People & Operations", jabatan: "SPV", gaji: 4500000 },
];