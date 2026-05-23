export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#060d1f" }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full -top-60 -left-40"
          style={{ background: "radial-gradient(circle, rgba(79,142,247,0.1) 0%, transparent 70%)" }} />
        <div className="absolute w-[500px] h-[500px] rounded-full -bottom-40 -right-40"
          style={{ background: "radial-gradient(circle, rgba(123,92,240,0.1) 0%, transparent 70%)" }} />
      </div>

      {/* Logo watermark */}
      <div className="absolute top-6 left-8 flex items-center gap-2.5 z-10">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>
          <span className="text-white font-bold text-sm">₿</span>
        </div>
        <span className="font-bold text-white">
          Amb<span style={{ color: "#4f8ef7" }}>Wallet</span>
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
