import { Employee } from "@/src/data/employeeData";

interface EmployeeTableProps {
    data: Employee[];
}

export default function EmployeeTable({ data }: EmployeeTableProps) {
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                            <th className="px-6 py-4">No</th>
                            <th className="px-6 py-4">Nama</th>
                            <th className="px-6 py-4">Umur</th>
                            <th className="px-6 py-4">Pendidikan</th>
                            <th className="px-6 py-4">Pengalaman</th>
                            <th className="px-6 py-4">Jabatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((employee, index) => (
                            <tr
                                key={employee.id}
                                className="group transition-colors hover:bg-emerald-50/30"
                            >
                                <td className="px-6 py-5 text-slate-400 font-medium">{String(index + 1).padStart(2, '0')}</td>
                                <td className="px-6 py-5 font-bold text-slate-900 group-hover:text-[#13624C] transition-colors">
                                    {employee.nama}
                                </td>
                                <td className="px-6 py-5 text-slate-600">{employee.umur} thn</td>
                                <td className="px-6 py-5">
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                                        {employee.pendidikan}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-slate-600">{employee.pengalamanKerja} tahun</td>
                                <td className="px-6 py-5 font-semibold text-slate-700">{employee.jabatan}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}