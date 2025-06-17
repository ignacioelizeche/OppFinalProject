"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { visualizationsAPI } from "@/lib/realApi"
import type { Visualization } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, LineChart } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import visualization components based on type
const LineChartComponent = dynamic(() => import("@/components/visualizations/line-chart"), {
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>,
  ssr: false,
})

const BarChartComponent = dynamic(() => import("@/components/visualizations/bar-chart"), {
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>,
  ssr: false,
})

const ScatterPlotComponent = dynamic(() => import("@/components/visualizations/scatter-plot"), {
  loading: () => <div className="h-80 flex items-center justify-center">Loading chart...</div>,
  ssr: false,
})

export default function VisualizationDetailPage() {
  const { id } = useParams()
  const vizId = Number(id)
  const [visualization, setVisualization] = useState<Visualization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchVisualization = async () => {
      setIsLoading(true)
      try {
        // In a real app, you'd have a specific endpoint to get a single visualization
        // For now, we'll fetch all visualizations and find the one we need
        const visualizations = await visualizationsAPI.getVisualizations()
        const foundViz = visualizations.find((v) => v.id === vizId)

        if (foundViz) {
          setVisualization(foundViz)
        } else {
          toast({
            variant: "destructive",
            title: "Visualization not found",
            description: "The requested visualization could not be found.",
          })
        }
      } catch (error) {
        console.error("Failed to fetch visualization:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load the visualization. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (vizId) {
      fetchVisualization()
    }
  }, [vizId, toast])

  // Render the appropriate visualization component based on type
  const renderVisualization = () => {
    if (!visualization) return null

    try {
      const data =
        typeof visualization.dataPayload === "string"
          ? JSON.parse(visualization.dataPayload)
          : visualization.dataPayload

      switch (visualization.visualizationType) {
        case "line":
          return <LineChartComponent data={data} />
        case "bar":
          return <BarChartComponent data={data} />
        case "scatter":
          return <ScatterPlotComponent data={data} />
        default:
          return (
            <div className="h-80 flex items-center justify-center bg-muted rounded-md">
              <div className="text-center">
                <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Visualization type not supported</p>
              </div>
            </div>
          )
      }
    } catch (error) {
      console.error("Error rendering visualization:", error)
      return (
        <div className="h-80 flex items-center justify-center bg-muted rounded-md">
          <div className="text-center">
            <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Error rendering visualization</p>
          </div>
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/visualizations" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Visualizations
          </Link>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-3/4 rounded-md bg-muted"></div>
            <div className="h-4 w-1/2 rounded-md bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 rounded-md bg-muted"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!visualization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link href="/visualizations" className="flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Visualizations
          </Link>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium">Visualization not found</h3>
            <p className="text-muted-foreground">The requested visualization could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/visualizations" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Visualizations
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{visualization.title}</CardTitle>
          <CardDescription>{visualization.topic}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert mb-6">
            <p>{visualization.description}</p>
          </div>

          <div className="rounded-md border p-4">{renderVisualization()}</div>
        </CardContent>
      </Card>
    </div>
  )
}

