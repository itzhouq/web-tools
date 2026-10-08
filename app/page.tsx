import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolExplorer } from "@/components/ToolExplorer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <ToolExplorer />
      <SiteFooter />
    </>
  );
}
