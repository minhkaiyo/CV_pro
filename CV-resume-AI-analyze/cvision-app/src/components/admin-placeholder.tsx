// Shared light-themed placeholder for admin pages under construction
import Link from "next/link";
import { Construction } from "lucide-react";

interface Props {
  title: string;
  description?: string;
}

export default function AdminPlaceholder({ title, description }: Props) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] font-inter">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Construction className="w-7 h-7 text-blue-500" />
        </div>
        <h1 className="text-[20px] font-bold text-gray-800 mb-2 tracking-tight">{title}</h1>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
          {description ?? "Tính năng này đang trong quá trình phát triển và sẽ sớm ra mắt."}
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-[#3b82f6] bg-blue-50 hover:bg-blue-100 transition-colors shadow-sm"
        >
          ← Quay lại Dashboard
        </Link>
      </div>
    </div>
  );
}
