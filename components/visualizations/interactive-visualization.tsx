"use client"

import { useState, useEffect, useRef } from "react"
import { Chart, type ChartConfiguration } from "chart.js/auto"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface InteractiveVisualizationProps {
  data: any
}

export default function InteractiveVisualization({ data }: InteractiveVisualizationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // State for parameters
  const [params, setParams] = useState(data.initialParams || {})

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    try {
      // Generate chart data based on visualization type and parameters
      let chartData: any = {
        labels: [],
        datasets: [],
      }

      const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "",
            },
          },
          y: {
            title: {
              display: true,
              text: "",
            },
          },
        },
      }

      // Configure chart based on visualization type
      switch (data.type) {
        case "quadratic":
          // Generate quadratic function data: f(x) = ax² + bx + c
          const { a, b, c } = params
          const xValues = Array.from(
            { length: 201 },
            (_, i) => data.xRange[0] + (i * (data.xRange[1] - data.xRange[0])) / 200,
          )

          chartData = {
            labels: xValues,
            datasets: [
              {
                label: `f(x) = ${a}x² + ${b}x + ${c}`,
                data: xValues.map((x) => a * x * x + b * x + c),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          }

          chartOptions.scales.x.title.text = "x"
          chartOptions.scales.y.title.text = "f(x)"
          break

        case "normal":
          // Generate normal distribution data
          const { mean, stdDev } = params
          const normalXValues = Array.from({ length: 101 }, (_, i) => mean - 4 * stdDev + (i * 8 * stdDev) / 100)

          chartData = {
            labels: normalXValues,
            datasets: [
              {
                label: `Normal Distribution (μ=${mean}, σ=${stdDev})`,
                data: normalXValues.map((x) => {
                  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2)
                  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
                }),
                borderColor: "rgb(153, 102, 255)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                tension: 0.1,
                pointRadius: 0,
                fill: true,
              },
            ],
          }

          chartOptions.scales.x.title.text = "x"
          chartOptions.scales.y.title.text = "Probability Density"
          break

        case "trigonometric":
          // Generate trigonometric function data
          const { amplitude, period, phaseShift } = params
          const trigXValues = Array.from({ length: 361 }, (_, i) => i)

          chartData = {
            labels: trigXValues,
            datasets: [
              {
                label: `sin(x) - Amplitude: ${amplitude}, Period: ${period}, Phase: ${phaseShift}`,
                data: trigXValues.map((x) => amplitude * Math.sin((x * period * Math.PI) / 180 + phaseShift)),
                borderColor: "rgb(255, 99, 132)",
                tension: 0.1,
                pointRadius: 0,
              },
              {
                label: `cos(x) - Amplitude: ${amplitude}, Period: ${period}, Phase: ${phaseShift}`,
                data: trigXValues.map((x) => amplitude * Math.cos((x * period * Math.PI) / 180 + phaseShift)),
                borderColor: "rgb(54, 162, 235)",
                tension: 0.1,
                pointRadius: 0,
              },
            ],
          }

          chartOptions.scales.x.title.text = "Degrees"
          chartOptions.scales.y.title.text = "Value"
          break

        default:
          // Default empty chart
          chartData = {
            labels: [],
            datasets: [
              {
                label: "No data",
                data: [],
                borderColor: "rgb(75, 192, 192)",
              },
            ],
          }
      }

      // Configure the chart
      const config: ChartConfiguration = {
        type: "line",
        data: chartData,
        options: chartOptions,
      }

      // Create the chart
      chartInstance.current = new Chart(ctx, config)
    } catch (error) {
      console.error("Error creating interactive visualization:", error)
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, params])

  // Render parameter controls based on visualization type
  const renderControls = () => {
    switch (data.type) {
      case "quadratic":
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>a: {params.a}</Label>
              </div>
              <Slider
                value={[params.a]}
                min={-5}
                max={5}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, a: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>b: {params.b}</Label>
              </div>
              <Slider
                value={[params.b]}
                min={-10}
                max={10}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, b: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>c: {params.c}</Label>
              </div>
              <Slider
                value={[params.c]}
                min={-10}
                max={10}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, c: value[0] })}
              />
            </div>
          </div>
        )

      case "normal":
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Mean (μ): {params.mean}</Label>
              </div>
              <Slider
                value={[params.mean]}
                min={-3}
                max={3}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, mean: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Standard Deviation (σ): {params.stdDev}</Label>
              </div>
              <Slider
                value={[params.stdDev]}
                min={0.1}
                max={2}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, stdDev: value[0] })}
              />
            </div>
          </div>
        )

      case "trigonometric":
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Amplitude: {params.amplitude}</Label>
              </div>
              <Slider
                value={[params.amplitude]}
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, amplitude: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Period: {params.period}</Label>
              </div>
              <Slider
                value={[params.period]}
                min={0.5}
                max={3}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, period: value[0] })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Phase Shift: {params.phaseShift.toFixed(2)}</Label>
              </div>
              <Slider
                value={[params.phaseShift]}
                min={0}
                max={Math.PI * 2}
                step={0.1}
                onValueChange={(value) => setParams({ ...params, phaseShift: value[0] })}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="h-80 w-full">
        <canvas ref={chartRef} />
      </div>
      {renderControls()}
    </div>
  )
}

