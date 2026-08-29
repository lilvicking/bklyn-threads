import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default function AdminPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-amber">DASHBOARD</h1>
        <p className="mt-1 text-sm text-silver-gray">Store performance &amp; stock watch.</p>
      </header>
      <AnalyticsDashboard />
    </div>
  );
}