import { Activity, BrainCircuit, FileCheck2, LayoutDashboard, Settings, WalletCards } from "lucide-react";

export type WorkspacePage = "overview" | "wallet" | "analysis" | "impact" | "documents" | "preferences";

const workspaceLinks = [
  { id: "overview", href: "/investor/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "wallet", href: "/wallet", label: "المحفظة", icon: WalletCards },
  { id: "analysis", href: "/analysis", label: "تحليل عائد AI", icon: BrainCircuit },
  { id: "impact", href: "/impact", label: "رحلة الأثر", icon: Activity },
  { id: "documents", href: "/documents", label: "المستندات", icon: FileCheck2 },
  { id: "preferences", href: "/preferences", label: "التفضيلات", icon: Settings },
] as const;

export function InvestorWorkspaceNav({ active }: { active: WorkspacePage }) {
  return (
    <aside className="workspace-sidebar">
      <span className="workspace-caption">مساحة المستثمر</span>
      <nav aria-label="أقسام مساحة المستثمر">
        {workspaceLinks.map((link) => {
          const Icon = link.icon;
          return <a className={active === link.id ? "active" : ""} href={link.href} key={link.id}><Icon size={18} />{link.label}<i /></a>;
        })}
      </nav>
      <div className="workspace-security"><span>اتصال آمن</span><strong>آخر مزامنة الآن</strong></div>
    </aside>
  );
}
