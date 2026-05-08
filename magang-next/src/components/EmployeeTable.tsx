import { Employee } from "@/src/data/employeeData";
import { useTranslation } from "../hooks/useTranslation";

interface EmployeeTableProps {
    data: any[];
    onDelete?: (id: number) => void;
    onEdit?: (emp: any) => void;
}

export default function EmployeeTable({ data, onDelete, onEdit }: EmployeeTableProps) {
    const { t } = useTranslation();
    return (
        <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm transition-colors duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                            <th className="px-6 py-4">No</th>
                            <th className="px-6 py-4">{t('pred.form.name')}</th>
                            <th className="px-6 py-4">{t('pred.form.division')}</th>
                            <th className="px-6 py-4">{t('pred.form.role')}</th>
                            <th className="px-6 py-4">{t('pred.form.gaji')}</th>
                            <th className="px-6 py-4 text-right">{t('employees.table.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                        {data.map((employee, index) => (
                            <tr
                                key={employee.id}
                                className="group transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10"
                            >
                                <td className="px-6 py-5 text-slate-400 dark:text-gray-500 font-medium">{String(index + 1).padStart(2, '0')}</td>
                                <td className="px-6 py-5 font-bold text-slate-900 dark:text-gray-200 group-hover:text-[#13624C] dark:group-hover:text-emerald-400 transition-colors">
                                    {employee.nama}
                                </td>
                                <td className="px-6 py-5">
                                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-600 dark:text-gray-400">
                                        {employee.divisi}
                                    </span>
                                </td>
                                <td className="px-6 py-5 font-semibold text-slate-700 dark:text-gray-300">{employee.jabatan}</td>
                                <td className="px-6 py-5 text-[#13624C] dark:text-emerald-400 font-bold">Rp {employee.gaji?.toLocaleString('id-ID')}</td>
                                <td className="px-6 py-5 text-right flex justify-end gap-2">
                                    {onEdit && (
                                        <button onClick={() => onEdit(employee)} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                            {t('employees.table.edit')}
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button onClick={() => onDelete(employee.id)} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                            {t('employees.table.delete')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}