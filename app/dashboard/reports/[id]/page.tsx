import { ReportViewer } from "@/components/reports/report-viewer"

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return <ReportViewer id={params.id} />
}
