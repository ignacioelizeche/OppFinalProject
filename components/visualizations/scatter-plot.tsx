"use client"

import { useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"

interface ScatterPlotProps {
  data: {
    datasets: Array<{
      label: string
      data: Array<{ x: number; y: number }>
      backgroundColor?: string
      borderColor?: string
      pointRadius?: number
    }>
    title?: string
    xAxisLabel?: string
    yAxisLabel?: string
  }
}

export default function ScatterPlot({ data }: ScatterPlotProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    try {
      // Configure the chart based on the provided data
      const config: ChartConfiguration = {
        type: "scatter",
        data: {
          datasets: data.datasets || [],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
            title: {
              display: !!data.title,
              text: data.title || "",
            },
          },
          scales: {
            x: {
              title: {
                display: !!data.xAxisLabel,
                text: data.xAxisLabel || "",
              },
            },
            y: {
              title: {
                display: !!data.yAxisLabel,
                text: data.yAxisLabel || "",
              },
            },
          },
        },
      }

      // Create the chart
      chartInstance.current = new Chart(ctx, config)
    } catch (error) {
      console.error("Error creating scatter plot:", error)
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="h-80 w-full">
      <canvas ref={chartRef} />
    </div>
  )
}

