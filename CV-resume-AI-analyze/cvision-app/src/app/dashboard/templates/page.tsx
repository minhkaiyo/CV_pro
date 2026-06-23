import { Check } from "lucide-react";

export default function TemplatesPage() {
  const templates = [
    { id: 1, name: "Modern Professional", color: "bg-blue-600", active: true },
    { id: 2, name: "Minimalist Clean", color: "bg-slate-800", active: false },
    { id: 3, name: "Creative Bold", color: "bg-purple-600", active: false },
    { id: 4, name: "Executive Standard", color: "bg-emerald-700", active: false },
  ];

  return (
    <div className="w-full max-w-5xl space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Thư viện Mẫu CV</h1>
      <p className="text-slate-600">Chọn mẫu giao diện (template) chuẩn ATS phù hợp nhất với ngành nghề của bạn.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
        {templates.map((tpl) => (
          <div key={tpl.id} className={`bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition ${tpl.active ? 'border-blue-600 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
            <div className={`h-40 ${tpl.color} p-4 flex flex-col justify-between relative`}>
              {tpl.active && (
                <div className="absolute top-3 right-3 bg-white text-blue-600 rounded-full p-1">
                  <Check className="w-4 h-4 font-bold" />
                </div>
              )}
              <div className="w-20 h-3 bg-white/30 rounded mb-2"></div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-white/20 rounded"></div>
                <div className="w-3/4 h-2 bg-white/20 rounded"></div>
              </div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-bold text-slate-800">{tpl.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Chuẩn ATS 100%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
