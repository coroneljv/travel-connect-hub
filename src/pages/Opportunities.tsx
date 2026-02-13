
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, Search, MapPin, Calendar, Building } from "lucide-react"
import { Input } from "@/components/ui/input"

const Opportunities = () => {
  const opportunities = [
    {
      id: 1,
      title: "Corporate Retreat - Bali 2024",
      type: "Accommodation",
      location: "Bali, Indonesia",
      date: "Sep 2024",
      budget: "$50k - $70k",
      status: "Open",
      tags: ["Luxury", "50+ Pax", "Event Space"],
    },
    {
      id: 2,
      title: "Tech Conference Transport",
      type: "Transportation",
      location: "San Francisco, USA",
      date: "Oct 2024",
      budget: "$15k - $20k",
      status: "Urgent",
      tags: ["Shuttle", "VIP Transfer"],
    },
    {
      id: 3,
      title: "Sales Team Annual Meeting",
      type: "Full Package",
      location: "Lisbon, Portugal",
      date: "Nov 2024",
      budget: "$30k - $45k",
      status: "Open",
      tags: ["Hotel", "Meeting Rooms", "Catering"],
    },
  ]

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
          <Input placeholder="Search opportunities..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="grid gap-6">
        {opportunities.map((opp) => (
          <Card key={opp.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">{opp.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {opp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {opp.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3 w-3" /> {opp.type}
                  </span>
                </div>
              </div>
              <Badge variant={opp.status === "Urgent" ? "destructive" : "secondary"}>
                {opp.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-2">
                  {opp.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-muted/50">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-lg">{opp.budget}</span>
                  <Button>View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Opportunities
