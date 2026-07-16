export default function DashboardSlugPage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard: {slug}</h1>
      <p className="text-muted-foreground">Content for workspace "{slug}" goes here.</p>
    </div>
  )
}


