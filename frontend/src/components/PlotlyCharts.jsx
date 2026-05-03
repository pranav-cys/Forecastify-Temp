import React from 'react'
import Plot from 'react-plotly.js'

const commonLayout = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { family: 'DM Sans, sans-serif', size: 12, color: '#64748b' },
  margin: { t: 20, b: 50, l: 60, r: 20 },
  xaxis: {
    showgrid: true,
    gridcolor: '#f1f5f9',
    linecolor: '#e2e8f0',
    tickfont: { size: 11, color: '#64748b' },
  },
  yaxis: {
    showgrid: true,
    gridcolor: '#f1f5f9',
    linecolor: '#e2e8f0',
    tickfont: { size: 11, color: '#64748b' },
  },
  legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center', font: { color: '#64748b' } },
  hovermode: 'x unified',
}

const plotConfig = {
  displayModeBar: true,
  modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d'],
  responsive: true,
  displaylogo: false,
}

export function LineChart({ actualDates, actualValues }) {
  if (!actualDates?.length || !actualValues?.length) return null

  const data = [
    {
      type: 'scatter',
      mode: 'lines',
      name: 'Revenue',
      x: actualDates,
      y: actualValues,
      line: {
        color: '#3b82f6',
        width: 2.5,
        shape: 'spline',
        smoothing: 0.8,
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(59, 130, 246, 0.08)',
      hovertemplate: '<b>%{x|%b %d, %Y}</b><br>Value: %{y:,.2f}<extra></extra>',
    },
  ]

  return (
    <Plot
      data={data}
      layout={{
        ...commonLayout,
        title: null,
        xaxis: {
          ...commonLayout.xaxis,
          type: 'date',
          tickformat: '%b %Y',
        },
      }}
      config={plotConfig}
      style={{ width: '100%', height: '320px' }}
      useResizeHandler
    />
  )
}

export function ForecastCombinedChart({ actualDates, actualValues, forecastDates, forecastValues, bestModel }) {
  if (!actualDates?.length || !forecastDates?.length) return null

    // Connect the lines by adding the last actual point to the forecast arrays
    const lastActualDate = actualDates[actualDates.length - 1];
    const lastActualValue = actualValues[actualValues.length - 1];
  
    const connectedForecastDates = [lastActualDate, ...forecastDates];
    const connectedForecastValues = [lastActualValue, ...forecastValues];

  const data = [
    {
      type: 'scatter',
      mode: 'lines',
      name: 'Actual',
      x: actualDates,
      y: actualValues,
      line: { color: '#3b82f6', width: 2.5 },
      hovertemplate: '<b>Actual</b><br>%{x|%b %d, %Y}<br>Value: %{y:,.2f}<extra></extra>',
    },
    {
      type: 'scatter',
      mode: 'lines',
      name: `Forecast (${bestModel || 'Model'})`,
      x: connectedForecastDates,
      y: connectedForecastValues,
      line: { color: '#0d9488', width: 2.5, dash: 'dot' },
      hovertemplate: '<b>Forecast</b><br>%{x|%b %d, %Y}<br>Value: %{y:,.2f}<extra></extra>',
    },
    // Shaded forecast area
    {
      type: 'scatter',
      mode: 'none',
      name: 'Forecast Range',
      x: [...connectedForecastDates, ...connectedForecastDates.slice().reverse()],
      y: [
        ...connectedForecastValues.map(v => v * 1.05),
        ...connectedForecastValues.slice().reverse().map(v => v * 0.95),
      ],
      fill: 'toself',
      fillcolor: 'rgba(13, 148, 136, 0.08)',
      line: { color: 'transparent' },
      showlegend: false,
      hoverinfo: 'skip',
    },
  ]

  return (
    <Plot
      data={data}
      layout={{
        ...commonLayout,
        xaxis: {
          ...commonLayout.xaxis,
          type: 'date',
          tickformat: '%b %Y',
        },
        shapes: [
          {
            type: 'line',
            x0: forecastDates[0],
            x1: forecastDates[0],
            y0: 0,
            y1: 1,
            yref: 'paper',
            line: { color: '#94a3b8', width: 1.5, dash: 'dash' },
          },
        ],
        annotations: [
          {
            x: forecastDates[0],
            y: 1,
            yref: 'paper',
            text: 'Forecast Start',
            showarrow: false,
            xanchor: 'left',
            font: { size: 10, color: '#94a3b8' },
            xshift: 6,
          },
        ],
      }}
      config={plotConfig}
      style={{ width: '100%', height: '380px' }}
      useResizeHandler
    />
  )
}
