"use client";

import { Search, MoreHorizontal, Plus } from "lucide-react";
const cardGlass: React.CSSProperties = {
  background: "rgba(10, 15, 28, 0.75)",
  backdropFilter: "blur(24px) saturate(160%)",
  WebkitBackdropFilter: "blur(24px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const selectStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "rgba(255,255,255,0.6)",
};

export default function AdminProducts() {
  return (
    <div className="w-full relative z-10 space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Sản phẩm</h1>
        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center transition hover:brightness-125"
            style={{ ...cardGlass }}
          >
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </button>
          <button
            className="h-10 px-4 rounded-lg flex items-center font-semibold text-sm text-white transition hover:brightness-125"
            style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
          >
            <Plus className="w-4 h-4 mr-2 text-blue-400" />
            Sản phẩm mới
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["Danh mục", "Sản phẩm", "Sắp xếp theo"].map((label) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-1.5">
              {label}
            </label>
            <select
              className="w-full h-10 px-3 rounded-lg text-sm outline-none"
              style={selectStyle}
            >
              <option style={{ background: "#0B0B0C" }}>Chọn {label.toLowerCase()}</option>
            </select>
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-white/30 uppercase tracking-widest mb-1.5">
            Tìm kiếm
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-white/25 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-white/25 outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={cardGlass}>
        <table className="w-full text-left">
          <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <tr className="text-white/30 text-xs uppercase tracking-wide">
              <th className="p-4 w-10">
                <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-500" />
              </th>
              <th className="py-4 px-2">Sản phẩm</th>
              <th className="py-4 px-2">Giá</th>
              <th className="py-4 px-2">Biến thể</th>
              <th className="py-4 px-2">Tồn kho</th>
              <th className="py-4 px-2">SKU</th>
              <th className="py-4 px-2">Trạng thái</th>
              <th className="py-4 px-4 w-10" />
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Premium", desc: "Gói đăng ký", price: "từ 199.000đ" },
              { name: "Pro",     desc: "Gói đăng ký", price: "từ 99.000đ"  },
              { name: "Basic",  desc: "Gói đăng ký", price: "từ 49.000đ"  },
            ].map((prod, i) => (
              <tr
                key={i}
                className="transition-colors text-sm"
                style={{ borderTop: "1px solid rgba(255,255,255,0.03)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="p-4">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-blue-500" />
                </td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white/50 font-bold text-sm shrink-0"
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.15)" }}
                    >
                      {prod.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-white/80">{prod.name}</div>
                      <div className="text-xs text-white/30">{prod.desc}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2 text-white/60">{prod.price}</td>
                <td className="py-4 px-2 text-white/25">—</td>
                <td className="py-4 px-2 text-white/25">—</td>
                <td className="py-4 px-2 text-white/25">—</td>
                <td className="py-4 px-2">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    Hoạt động
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <MoreHorizontal className="w-4 h-4 text-white/20 hover:text-white/60 cursor-pointer ml-auto transition" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          className="p-4 flex items-center justify-between text-xs text-white/30"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            Page size:
            <select
              className="rounded px-2 py-1 outline-none text-white/50"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <option style={{ background: "#0B0B0C" }}>25</option>
            </select>
            <span className="ml-1">1 to 3 of 3</span>
          </div>
          <div className="flex items-center gap-3 text-white/20">
            <span className="cursor-not-allowed">«</span>
            <span className="cursor-not-allowed">‹</span>
            <span className="font-semibold text-white/50">Page 1 of 1</span>
            <span className="cursor-not-allowed">›</span>
            <span className="cursor-not-allowed">»</span>
          </div>
        </div>
      </div>
    </div>
  );
}
