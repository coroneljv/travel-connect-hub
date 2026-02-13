
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { cn } from "@/lib/utils"

const CreateRequest = () => {
  const [date, setDate] = useState<Date>()

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Travel Request</h1>
        <p className="text-muted-foreground mt-2">Create a new service request for the marketplace.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Specify your requirements to get the best proposals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Request Title</Label>
            <Input id="title" placeholder="e.g. Annual Company Retreat 2024" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type">Service Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="transport">Transportation</SelectItem>
                  <SelectItem value="events">Events & Meetings</SelectItem>
                  <SelectItem value="full">Full Package</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Needed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location / Destination</Label>
            <Input id="location" placeholder="City, Country or Region" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Estimated Budget</Label>
            <Input id="budget" placeholder="e.g. $10,000 - $15,000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Requirements</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your needs, number of people, specific preferences..." 
              className="min-h-[150px]"
            />
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Upload supporting documents</p>
            <p className="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline">Save Draft</Button>
            <Button>Publish Request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateRequest
