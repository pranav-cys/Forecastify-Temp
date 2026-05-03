import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

const LIGHT_COLORS = ['#3b82f6', '#0d9488', '#f59e0b', '#7c3aed', '#f43f5e', '#06b6d4', '#84cc16', '#ec4899']

const commonOptions = {
  textStyle: { fontFamily: 'DM Sans, sans-serif' },
  backgroundColor: 'transparent',
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#e2e8f0',
    textStyle: { color: '#334155', fontSize: 12 },
    padding: [8, 12],
    borderRadius: 8,
    extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);'
  },
}

export function BarChart({ data, title = 'Value' }) {
  const option = useMemo(() => {
    if (!data?.length) return {}
    
    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip, trigger: 'axis' },
      grid: { top: 50, right: 30, bottom: 60, left: 60 },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLabel: { color: '#64748b', fontSize: 10, rotate: 45, width: 80, overflow: 'truncate', formatter: val => val.length > 15 ? val.substring(0,15) + '...' : val },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val) => val >= 1000 ? (val/1000) + 'k' : val },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        name: title,
        nameLocation: 'end',
        nameTextStyle: { color: '#475569', fontSize: 10, align: 'right' },
      },
      legend: {
        type: 'scroll',
        top: 0,
        left: 'center',
        padding: [0, 20],
        textStyle: { color: '#475569', fontSize: 10 }
      },
      series: data.map((d, i) => {
        const sData = new Array(data.length).fill(null)
        sData[i] = d.value
        return {
          name: d.name,
          type: 'bar',
          data: sData,
          barMaxWidth: 40,
          itemStyle: { color: LIGHT_COLORS[i % LIGHT_COLORS.length] },
          borderRadius: [4, 4, 0, 0]
        }
      })
    }
  }, [data, title])

  if (!data?.length) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function HorizontalBarChart({ data }) {
  const option = useMemo(() => {
    if (!data?.length) return {}
    
    // Sort ascending for horizontal bar (bottom to top)
    const sorted = [...data].sort((a, b) => a.value - b.value)
    
    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 50, right: 30, bottom: 40, left: 120 },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val) => val >= 1000000 ? (val/1000000)+'M' : val >= 1000 ? (val/1000)+'K' : val },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map(d => d.name),
        axisLabel: { color: '#475569', fontSize: 10, formatter: val => val.length > 20 ? val.substring(0, 18) + '...' : val },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: null,
      legend: {
        type: 'scroll',
        top: 0,
        left: 'center',
        padding: [0, 20],
        textStyle: { color: '#475569', fontSize: 10 }
      },
      series: sorted.map((d, i) => {
        const sData = new Array(sorted.length).fill(null)
        sData[i] = d.value
        return {
          name: d.name,
          type: 'bar',
          data: sData,
          barMaxWidth: 20,
          itemStyle: { color: LIGHT_COLORS[i % LIGHT_COLORS.length] },
          borderRadius: [0, 4, 4, 0]
        }
      })
    }
  }, [data])

  if (!data?.length) return null

  return <ReactECharts option={option} style={{ height: '350px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function ScatterChart({ data }) {
  const option = useMemo(() => {
    if (!data?.length) return {}
    
    return {
      ...commonOptions,
      tooltip: {
        ...commonOptions.tooltip,
        formatter: (params) => {
          return `<b>${params.data[2]}</b><br/>Revenue: ₹${params.data[0].toLocaleString()}<br/>Profit: ₹${params.data[1].toLocaleString()}`
        }
      },
      grid: { top: 60, right: 40, bottom: 50, left: 60 },
      xAxis: {
        name: 'Revenue',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: '#475569', fontSize: 11 },
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val) => val >= 1000000 ? (val/1000000)+'M' : val >= 1000 ? (val/1000)+'K' : val },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        name: 'Profit',
        nameLocation: 'middle',
        nameGap: 45,
        nameTextStyle: { color: '#475569', fontSize: 11 },
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val) => val >= 1000000 ? (val/1000000)+'M' : val >= 1000 ? (val/1000)+'K' : val },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      legend: {
        type: 'scroll',
        top: 0,
        left: 'center',
        padding: [0, 20],
        textStyle: { color: '#475569', fontSize: 10 },
      },
      series: data.map((d, i) => ({
        name: d.name,
        type: 'scatter',
        symbolSize: 18,
        itemStyle: { color: LIGHT_COLORS[i % LIGHT_COLORS.length], opacity: 0.8 },
        data: [[d.revenue, d.profit, d.name]],
      })),
    }
  }, [data])

  if (!data?.length) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function PieChart({ data }) {
  const option = useMemo(() => {
    if (!data?.length) return {}

    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip, trigger: 'item' },
      legend: {
        type: 'scroll',
        top: 0,
        left: 'center',
        textStyle: { color: '#475569', fontSize: 10 },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: { show: true, position: 'inside', formatter: '{d}%', color: '#fff', fontSize: 10, fontWeight: 'bold' },
          labelLine: { show: false },
          data: data.map((d, i) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: LIGHT_COLORS[i % LIGHT_COLORS.length] }
          })),
        },
      ],
    }
  }, [data])

  if (!data?.length) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function MultiLineChart({ data }) {
  const option = useMemo(() => {
    if (!data?.months?.length || !data?.series) return {}

    const seriesData = Object.keys(data.series).map((key, i) => ({
      name: key,
      type: 'line',
      smooth: true,
      showSymbol: true,
      symbolSize: 6,
      data: data.series[key],
      itemStyle: { color: LIGHT_COLORS[i % LIGHT_COLORS.length] },
      lineStyle: { width: 2 },
    }))

    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip, trigger: 'axis' },
      legend: {
        type: 'scroll',
        top: 0,
        left: 'center',
        padding: [0, 20],
        textStyle: { color: '#475569', fontSize: 10 },
        data: Object.keys(data.series),
      },
      grid: { top: 50, right: 30, bottom: 60, left: 60 },
      xAxis: {
        type: 'category',
        data: data.months,
        axisLabel: { color: '#64748b', fontSize: 10, rotate: 45 },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', fontSize: 10, formatter: (val) => val >= 1000000 ? (val/1000000)+'M' : val >= 1000 ? (val/1000)+'K' : val },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: seriesData,
    }
  }, [data])

  if (!data?.months?.length) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function CorrelationHeatmap({ actualDates, actualValues }) {
  const option = useMemo(() => {
    if (!actualDates?.length || !actualValues?.length) return {}

    const matrixData = []
    const months = []
    const buckets = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']

    const grouped = {}
    actualDates.forEach((date, i) => {
      const d = date instanceof Date ? date : new Date(date)
      if (isNaN(d.getTime())) return
      const monthKey = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
      const week = Math.min(Math.floor((d.getDate() - 1) / 7), 3)
      if (!grouped[monthKey]) grouped[monthKey] = [[], [], [], []]
      grouped[monthKey][week].push(actualValues[i] || 0)
    })

    const sortedMonths = Object.keys(grouped).slice(-8)
    sortedMonths.forEach(m => { if (!months.includes(m)) months.push(m) })

    let minV = Infinity, maxV = -Infinity
    sortedMonths.forEach((month, mi) => {
      buckets.forEach((_, wi) => {
        const arr = grouped[month]?.[wi] || []
        const avg = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
        matrixData.push([wi, mi, +avg.toFixed(2)])
        if (avg < minV) minV = avg
        if (avg > maxV) maxV = avg
      })
    })

    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip },
      grid: { top: 10, right: 80, bottom: 40, left: 70 },
      xAxis: {
        type: 'category',
        data: buckets,
        splitArea: { show: true, areaStyle: { color: ['transparent', 'rgba(0,0,0,0.02)'] } },
        axisLabel: { fontSize: 10, color: '#64748b' },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'category',
        data: sortedMonths,
        splitArea: { show: true, areaStyle: { color: ['transparent', 'rgba(0,0,0,0.02)'] } },
        axisLabel: { fontSize: 10, color: '#64748b' },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      visualMap: {
        min: minV,
        max: maxV,
        calculable: true,
        orient: 'vertical',
        right: 0,
        top: 'center',
        inRange: { color: ['#f8fafc', '#93c5fd', '#1e3a8a'] },
        textStyle: { fontSize: 9, color: '#64748b' },
      },
      series: [
        {
          type: 'heatmap',
          data: matrixData,
          label: {
            show: true,
            fontSize: 9,
            color: '#0f172a',
            formatter: (p) => p.data[2] > 0 ? p.data[2].toLocaleString(undefined, { maximumFractionDigits: 0 }) : '',
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 1,
          },
        },
      ],
    }
  }, [actualDates, actualValues])

  if (!actualDates?.length) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}

export function CategoryRegionHeatmap({ data }) {
  const option = useMemo(() => {
    if (!data?.categories || !data?.regions || !data?.data) return {}

    const vals = data.data.map(d => d[2])
    const minV = Math.min(...vals)
    const maxV = Math.max(...vals)

    return {
      ...commonOptions,
      tooltip: { ...commonOptions.tooltip },
      grid: { top: 30, right: 80, bottom: 60, left: 100 },
      xAxis: {
        type: 'category',
        data: data.regions,
        axisLabel: { fontSize: 10, color: '#64748b', rotate: 30 },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      yAxis: {
        type: 'category',
        data: data.categories,
        axisLabel: { fontSize: 10, color: '#64748b', formatter: val => val.length > 12 ? val.substring(0, 10) + '...' : val },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
      },
      visualMap: {
        min: minV,
        max: maxV,
        calculable: true,
        orient: 'vertical',
        right: 0,
        top: 'center',
        inRange: { color: ['#f8fafc', '#38bdf8', '#0369a1'] },
        textStyle: { fontSize: 9, color: '#64748b' },
      },
      series: [
        {
          type: 'heatmap',
          data: data.data,
          label: {
            show: true,
            fontSize: 9,
            color: '#0f172a',
            formatter: (p) => p.data[2] > 0 ? (p.data[2]/1000000).toFixed(1) + 'M' : '',
          },
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        },
      ],
    }
  }, [data])

  if (!data?.categories) return null

  return <ReactECharts option={option} style={{ height: '320px', width: '100%' }} opts={{ renderer: 'svg' }} />
}
