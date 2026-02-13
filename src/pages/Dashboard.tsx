
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Globe2, Users, FileCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

const Dashboard = () => {
  const { profile, organization, userRole } = useAuth()

  const { data: requestCount = 0 } = useQuery({
    queryKey: ["dashboard-requests", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 0
      const { count } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id)
      return count ?? 0
    },
    enabled: !!organization?.id,
  })

  const { data: proposalCount = 0 } = useQuery({
    queryKey: ["dashboard-proposals", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 0
      const { count } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("supplier_org_id", organization.id)
        .eq("status", "pending")
      return count ?? 0
    },
    enabled: !!organization?.id && userRole === "supplier",
  })

  const { data: openRequests = 0 } = useQuery({
    queryKey: ["dashboard-open-requests"],
    queryFn: async () => {
      const { count } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "open")
      return count ?? 0
    },
  })

  const { data: recentRequests = [] } = useQuery({
    queryKey: ["dashboard-recent", organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("requests")
        .select("id, title, destination, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
      return data ?? []
    },
  })

  const metrics = [
    { label: userRole === "supplier" ? "Open Opportunities" : "My Requests", value: String(userRole === "supplier" ? openRequests : requestCount), icon: FileCheck, color: "text-blue-500" },
    { label: "Pending Proposals", value: String(proposalCount), icon: Globe2, color: "text-green-500" },
    { label: "Marketplace", value: String(openRequests), icon: Users, color: "text-purple-500" },
    { label: "Role", value: userRole ?? "—", icon: BarChart3, color: "text-orange-500" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {profile?.full_name}. Here's your overview.</p>
        </div>
        {userRole === "buyer" && (
          <Button asChild>
            <Link to="/requests/new">New Request</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest travel requests on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">No requests yet.</p>
              )}
              {recentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {req.title?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{req.title}</p>
                    <p className="text-sm text-muted-foreground">{req.destination} · {req.status}</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole === "buyer" && (
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link to="/requests/new">
                  Create Travel Request <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/opportunities">
                Browse Marketplace <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/profile">
                Update Company Profile <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
