
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, Mail, MapPin, Phone, Upload } from "lucide-react"

const Profile = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your institutional information and service offerings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="services">Services & Regions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Institutional Data</CardTitle>
              <CardDescription>Basic company information visible to partners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  DA
                </div>
                <Button variant="outline">Change Logo</Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" defaultValue="Demo Agency Ltd." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / Registration</Label>
                  <Input id="tax-id" defaultValue="US-123456789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="website" className="pl-9" defaultValue="www.demo-agency.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" className="pl-9" defaultValue="contact@demo-agency.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" className="pl-9" defaultValue="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="address" className="pl-9" defaultValue="123 Business Ave, New York, NY" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About Us</Label>
                <Textarea id="bio" className="min-h-[100px]" defaultValue="We are a leading travel agency specializing in corporate travel management and events." />
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services & Coverage</CardTitle>
              <CardDescription>Define what you offer and where you operate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Service Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {["Corporate Travel", "MICE", "Leisure", "VIP Services", "Flights", "Hotels"].map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {tag} ×
                    </Badge>
                  ))}
                  <Badge variant="outline" className="cursor-pointer border-dashed">
                    + Add Category
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Regions Served</Label>
                <div className="flex flex-wrap gap-2">
                  {["North America", "Western Europe", "Southeast Asia"].map((region) => (
                    <Badge key={region} variant="outline" className="cursor-pointer hover:bg-muted">
                      {region} ×
                    </Badge>
                  ))}
                  <Badge variant="outline" className="cursor-pointer border-dashed">
                    + Add Region
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Legal Documents</CardTitle>
              <CardDescription>Upload necessary documentation for verification.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Business License</p>
                    <p className="text-sm text-muted-foreground">Verified on Jan 15, 2024</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50">Verified</Badge>
              </div>

              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Insurance Policy</p>
                    <p className="text-sm text-muted-foreground">Expires Dec 2024</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50/50">Verified</Badge>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Upload new document</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile
