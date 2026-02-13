
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, Search, MapPin, Calendar, Building } from "lucide-react"
import { Input } from "@/components/ui/input"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const Opportunities = () => {
  const { userRole, organization, user } = useAuth()
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [proposalMessage, setProposalMessage] = useState("")
  const [priceEstimate, setPriceEstimate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", search],
    queryFn: async () => {
      let query = supabase
        .from("requests")
        .select("*, organizations!requests_organization_id_fkey(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false })

      if (search) {
        query = query.or(`title.ilike.%${search}%,destination.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
  })

  const handleSubmitProposal = async () => {
    if (!selectedRequest || !organization?.id || !user?.id) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from("proposals").insert({
        request_id: selectedRequest.id,
        supplier_org_id: organization.id,
        supplier_profile_id: user.id,
        message: proposalMessage,
        price_estimate: priceEstimate ? Number(priceEstimate) : null,
      })
      if (error) throw error
      toast.success("Proposal submitted!")
      setSelectedRequest(null)
      setProposalMessage("")
      setPriceEstimate("")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit proposal")
    } finally {
      setSubmitting(false)
    }
  }

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified"
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    return `Up to $${max!.toLocaleString()}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Find and respond to travel opportunities.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : opportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No open opportunities found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {opportunities.map((opp: any) => (
            <Card key={opp.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{opp.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {opp.destination}
                    </span>
                    {opp.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {new Date(opp.start_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3" /> {opp.organizations?.name ?? "Unknown"}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">{opp.status}</Badge>
              </CardHeader>
              <CardContent>
                {opp.description && (
                  <p className="text-sm text-muted-foreground mb-4">{opp.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{formatBudget(opp.budget_min, opp.budget_max)}</span>
                  {userRole === "supplier" && (
                    <Button onClick={() => setSelectedRequest(opp)}>Submit Proposal</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Proposal</DialogTitle>
            <DialogDescription>For: {selectedRequest?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Price Estimate ($)</Label>
              <Input type="number" value={priceEstimate} onChange={(e) => setPriceEstimate(e.target.value)} placeholder="e.g. 25000" />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={proposalMessage} onChange={(e) => setProposalMessage(e.target.value)} placeholder="Describe your offer..." className="min-h-[100px]" />
            </div>
            <Button className="w-full" onClick={handleSubmitProposal} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Opportunities
