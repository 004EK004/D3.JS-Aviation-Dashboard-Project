import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Plane, TrendingUp, Network, MapPin, Clock, BarChart3, Zap, Globe2 } from 'lucide-react';

const D3AviationDashboard = () => {
  const networkRef = useRef(null);
  const sankeyRef = useRef(null);
  const heatmapRef = useRef(null);
  const radarRef = useRef(null);
  const streamRef = useRef(null);
  const sunburstRef = useRef(null);
  
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('frequency');
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // Enhanced aviation dataset
  const airports = [
    { id: 'JFK', name: 'John F. Kennedy', city: 'New York', region: 'North America', lat: 40.6413, lon: -73.7781, tier: 1, volume: 62500000, efficiency: 85 },
    { id: 'LHR', name: 'Heathrow', city: 'London', region: 'Europe', lat: 51.4700, lon: -0.4543, tier: 1, volume: 80900000, efficiency: 88 },
    { id: 'NRT', name: 'Narita', city: 'Tokyo', region: 'Asia', lat: 35.7720, lon: 140.3929, tier: 1, volume: 33400000, efficiency: 92 },
    { id: 'DXB', name: 'Dubai International', city: 'Dubai', region: 'Middle East', lat: 25.2532, lon: 55.3657, tier: 1, volume: 86400000, efficiency: 90 },
    { id: 'LAX', name: 'Los Angeles', city: 'Los Angeles', region: 'North America', lat: 33.9425, lon: -118.4081, tier: 1, volume: 87500000, efficiency: 83 },
    { id: 'CDG', name: 'Charles de Gaulle', city: 'Paris', region: 'Europe', lat: 49.0097, lon: 2.5479, tier: 1, volume: 76200000, efficiency: 87 },
    { id: 'FRA', name: 'Frankfurt', city: 'Frankfurt', region: 'Europe', lat: 50.0379, lon: 8.5622, tier: 1, volume: 70600000, efficiency: 91 },
    { id: 'SIN', name: 'Changi', city: 'Singapore', region: 'Asia', lat: 1.3644, lon: 103.9915, tier: 1, volume: 68300000, efficiency: 94 },
    { id: 'SYD', name: 'Sydney', city: 'Sydney', region: 'Oceania', lat: -33.9399, lon: 151.1753, tier: 2, volume: 44400000, efficiency: 89 },
    { id: 'PEK', name: 'Beijing Capital', city: 'Beijing', region: 'Asia', lat: 39.5098, lon: 116.4105, tier: 1, volume: 100900000, efficiency: 86 },
    { id: 'ICN', name: 'Incheon', city: 'Seoul', region: 'Asia', lat: 37.4602, lon: 126.4407, tier: 1, volume: 71200000, efficiency: 93 },
    { id: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', region: 'Europe', lat: 52.3105, lon: 4.7683, tier: 1, volume: 71700000, efficiency: 88 }
  ];

  const aircraftData = [
    { model: 'Boeing 777-300ER', manufacturer: 'Boeing', capacity: 396, range: 14690, fuelEfficiency: 3.2, reliability: 96, category: 'Wide-body', costIndex: 85 },
    { model: 'Airbus A380-800', manufacturer: 'Airbus', capacity: 853, range: 15200, fuelEfficiency: 2.9, reliability: 94, category: 'Super-jumbo', costIndex: 92 },
    { model: 'Boeing 787-9', manufacturer: 'Boeing', capacity: 290, range: 14800, fuelEfficiency: 4.1, reliability: 98, category: 'Wide-body', costIndex: 78 },
    { model: 'Airbus A350-900', manufacturer: 'Airbus', capacity: 325, range: 15000, fuelEfficiency: 3.8, reliability: 97, category: 'Wide-body', costIndex: 80 },
    { model: 'Boeing 737 MAX 8', manufacturer: 'Boeing', capacity: 189, range: 6570, fuelEfficiency: 4.5, reliability: 95, category: 'Narrow-body', costIndex: 65 },
    { model: 'Airbus A321neo', manufacturer: 'Airbus', capacity: 244, range: 7400, fuelEfficiency: 4.3, reliability: 96, category: 'Narrow-body', costIndex: 68 }
  ];

  // Generate complex route network data
  const generateRouteNetwork = () => {
    const routes = [];
    const airlines = ['Emirates', 'Singapore Airlines', 'British Airways', 'Lufthansa', 'American Airlines', 'Japan Airlines'];
    
    airports.forEach((origin, i) => {
      airports.forEach((dest, j) => {
        if (i !== j && Math.random() > 0.6) {
          const distance = calculateDistance(origin.lat, origin.lon, dest.lat, dest.lon);
          const frequency = Math.floor(Math.random() * 14) + 1;
          const aircraft = aircraftData[Math.floor(Math.random() * aircraftData.length)];
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          
          routes.push({
            source: origin.id,
            target: dest.id,
            distance: Math.round(distance),
            frequency: frequency,
            aircraft: aircraft.model,
            airline,
            revenue: frequency * aircraft.capacity * 0.3 * (distance / 1000),
            passengers: frequency * aircraft.capacity * (0.7 + Math.random() * 0.3)
          });
        }
      });
    });
    return routes;
  };

  const routes = generateRouteNetwork();

  // Time series data for stream graph
  const generateTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const regions = ['North America', 'Europe', 'Asia', 'Middle East', 'Oceania'];
    
    return months.map(month => {
      const data = { month };
      regions.forEach(region => {
        data[region] = Math.random() * 1000000 + 500000; // Passenger volume
      });
      return data;
    });
  };

  const timeSeriesData = generateTimeSeriesData();

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Network Force Simulation
  useEffect(() => {
    if (!networkRef.current) return;

    const container = d3.select(networkRef.current);
    container.selectAll('*').remove();

    const width = 600;
    const height = 400;

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Create network data
    const nodes = airports.map(airport => ({
      id: airport.id,
      name: airport.name,
      region: airport.region,
      volume: airport.volume,
      tier: airport.tier,
      x: width * Math.random(),
      y: height * Math.random()
    }));

    const links = routes
      .filter(route => route.frequency > 5)
      .map(route => ({
        source: route.source,
        target: route.target,
        frequency: route.frequency,
        distance: route.distance
      }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => Math.min(200, d.distance / 100)))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.volume / 1000000) * 3 + 10));

    // Color scale for regions
    const colorScale = d3.scaleOrdinal()
      .domain(['North America', 'Europe', 'Asia', 'Middle East', 'Oceania'])
      .range(['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']);

    // Draw links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.frequency));

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.volume / 1000000) * 2 + 8)
      .attr('fill', d => colorScale(d.region))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add labels
    const labels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
      .attr('font-size', '12px')
      .attr('fill', '#ffffff')
      .attr('text-anchor', 'middle')
      .attr('dy', -15);

    // Tooltips
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('font-size', '12px');

    node.on('mouseover', (event, d) => {
      tooltip.style('visibility', 'visible')
        .html(`<strong>${d.name}</strong><br/>Volume: ${(d.volume / 1000000).toFixed(1)}M<br/>Region: ${d.region}`);
    })
    .on('mousemove', (event) => {
      tooltip.style('top', (event.pageY - 10) + 'px')
        .style('left', (event.pageX + 10) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('visibility', 'hidden');
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      tooltip.remove();
    };
  }, [regionFilter]);

  // Sankey Diagram for Route Flow
  useEffect(() => {
    if (!sankeyRef.current) return;

    const container = d3.select(sankeyRef.current);
    container.selectAll('*').remove();

    const width = 500;
    const height = 300;

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    // Create Sankey data structure
    const sankeyData = {
      nodes: [],
      links: []
    };

    // Add regions as source nodes
    const regions = [...new Set(airports.map(a => a.region))];
    regions.forEach(region => {
      sankeyData.nodes.push({ id: region, category: 'region' });
    });

    // Add aircraft types as target nodes
    const aircraftTypes = [...new Set(aircraftData.map(a => a.category))];
    aircraftTypes.forEach(type => {
      sankeyData.nodes.push({ id: type, category: 'aircraft' });
    });

    // Create links based on route data
    const regionAircraftFlow = {};
    routes.forEach(route => {
      const sourceAirport = airports.find(a => a.id === route.source);
      const aircraftType = aircraftData.find(a => a.model === route.aircraft)?.category;
      
      if (sourceAirport && aircraftType) {
        const key = `${sourceAirport.region}-${aircraftType}`;
        if (!regionAircraftFlow[key]) {
          regionAircraftFlow[key] = 0;
        }
        regionAircraftFlow[key] += route.passengers;
      }
    });

    Object.entries(regionAircraftFlow).forEach(([key, value]) => {
      const [source, target] = key.split('-');
      sankeyData.links.push({
        source,
        target,
        value: Math.round(value)
      });
    });

    // Simple Sankey layout
    const nodeWidth = 15;
    const nodePadding = 10;
    const regionNodes = sankeyData.nodes.filter(n => n.category === 'region');
    const aircraftNodes = sankeyData.nodes.filter(n => n.category === 'aircraft');

    // Position region nodes on the left
    regionNodes.forEach((node, i) => {
      node.x0 = 50;
      node.x1 = 50 + nodeWidth;
      node.y0 = i * (height / regionNodes.length);
      node.y1 = node.y0 + (height / regionNodes.length) - nodePadding;
    });

    // Position aircraft nodes on the right
    aircraftNodes.forEach((node, i) => {
      node.x0 = width - 50 - nodeWidth;
      node.x1 = width - 50;
      node.y0 = i * (height / aircraftNodes.length);
      node.y1 = node.y0 + (height / aircraftNodes.length) - nodePadding;
    });

    const colorScale = d3.scaleOrdinal()
      .domain(regions)
      .range(['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']);

    // Draw nodes
    svg.selectAll('.node')
      .data(sankeyData.nodes)
      .join('rect')
      .attr('class', 'node')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => d.category === 'region' ? colorScale(d.id) : '#64748b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    // Draw links
    const linkGenerator = d3.linkHorizontal()
      .x(d => d.x)
      .y(d => d.y);

    sankeyData.links.forEach(link => {
      const sourceNode = sankeyData.nodes.find(n => n.id === link.source);
      const targetNode = sankeyData.nodes.find(n => n.id === link.target);
      
      if (sourceNode && targetNode) {
        const linkPath = svg.append('path')
          .datum({
            source: {
              x: sourceNode.x1,
              y: (sourceNode.y0 + sourceNode.y1) / 2
            },
            target: {
              x: targetNode.x0,
              y: (targetNode.y0 + targetNode.y1) / 2
            }
          })
          .attr('d', linkGenerator)
          .attr('stroke', colorScale(link.source))
          .attr('stroke-width', Math.max(1, link.value / 50000))
          .attr('stroke-opacity', 0.6)
          .attr('fill', 'none');
      }
    });

    // Add labels
    svg.selectAll('.node-label')
      .data(sankeyData.nodes)
      .join('text')
      .attr('class', 'node-label')
      .attr('x', d => d.category === 'region' ? d.x0 - 5 : d.x1 + 5)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('text-anchor', d => d.category === 'region' ? 'end' : 'start')
      .attr('dy', '0.35em')
      .attr('fill', '#ffffff')
      .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
      .attr('font-size', '12px')
      .text(d => d.id);

  }, []);

  // Heatmap for Airport Efficiency vs Volume
  useEffect(() => {
    if (!heatmapRef.current) return;

    const container = d3.select(heatmapRef.current);
    container.selectAll('*').remove();

    const margin = { top: 50, right: 60, bottom: 60, left: 60 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create grid data
    const gridSize = 20;
    const xBins = Math.floor(width / gridSize);
    const yBins = Math.floor(height / gridSize);

    const volumeExtent = d3.extent(airports, d => d.volume);
    const efficiencyExtent = d3.extent(airports, d => d.efficiency);

    const xScale = d3.scaleLinear()
      .domain(volumeExtent)
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(efficiencyExtent)
      .range([height, 0]);

    // Create heatmap grid
    const gridData = [];
    for (let x = 0; x < xBins; x++) {
      for (let y = 0; y < yBins; y++) {
        const volume = xScale.invert(x * gridSize);
        const efficiency = yScale.invert(y * gridSize);
        
        // Calculate intensity based on proximity to actual airports
        let intensity = 0;
        airports.forEach(airport => {
          const distance = Math.sqrt(
            Math.pow(airport.volume - volume, 2) + 
            Math.pow(airport.efficiency - efficiency, 2)
          );
          intensity += Math.exp(-distance / 10000000); // Gaussian kernel
        });

        gridData.push({
          x: x * gridSize,
          y: y * gridSize,
          intensity: intensity
        });
      }
    }

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(gridData, d => d.intensity)]);

    // Draw heatmap
    g.selectAll('.heat-rect')
      .data(gridData)
      .join('rect')
      .attr('class', 'heat-rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', gridSize)
      .attr('height', gridSize)
      .attr('fill', d => colorScale(d.intensity))
      .attr('opacity', 0.7);

    // Plot airports as circles
    g.selectAll('.airport-point')
      .data(airports)
      .join('circle')
      .attr('class', 'airport-point')
      .attr('cx', d => xScale(d.volume))
      .attr('cy', d => yScale(d.efficiency))
      .attr('r', 4)
      .attr('fill', '#ffffff')
      .attr('stroke', '#000000')
      .attr('stroke-width', 1);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => (d / 1000000).toFixed(0) + 'M');
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .attr('color', '#ffffff');

    g.append('g')
      .call(yAxis)
      .attr('color', '#ffffff');

    // Labels
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + 50})`)
      .style('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
      .text('Annual Passengers');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
      .text('Efficiency Score');

  }, []);

  // Radar Chart for Aircraft Performance
  useEffect(() => {
    if (!radarRef.current) return;

    const container = d3.select(radarRef.current);
    container.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Radar metrics
    const metrics = [
      { key: 'capacity', label: 'Capacity', max: 1000 },
      { key: 'range', label: 'Range', max: 20000 },
      { key: 'fuelEfficiency', label: 'Fuel Efficiency', max: 5 },
      { key: 'reliability', label: 'Reliability', max: 100 },
      { key: 'costIndex', label: 'Cost Efficiency', max: 100 }
    ];

    const angleSlice = (Math.PI * 2) / metrics.length;

    // Draw radar grid
    const levels = 5;
    for (let level = 1; level <= levels; level++) {
      const levelRadius = radius * (level / levels);
      
      g.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#64748b')
        .attr('stroke-opacity', 0.3);
    }

    // Draw axis lines
    metrics.forEach((metric, i) => {
      const angle = i * angleSlice - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .attr('stroke', '#64748b')
        .attr('stroke-opacity', 0.3);

      // Add labels
      g.append('text')
        .attr('x', x * 1.1)
        .attr('y', y * 1.1)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#ffffff')
        .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
        .attr('font-size', '12px')
        .text(metric.label);
    });

    // Draw aircraft data
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316'];
    
    aircraftData.slice(0, 3).forEach((aircraft, aircraftIndex) => {
      const radarData = metrics.map((metric, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const value = aircraft[metric.key];
        const normalizedValue = value / metric.max;
        const r = radius * normalizedValue;
        
        return {
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          value: value
        };
      });

      // Close the path
      radarData.push(radarData[0]);

      const line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveLinearClosed);

      g.append('path')
        .datum(radarData)
        .attr('d', line)
        .attr('fill', colors[aircraftIndex])
        .attr('fill-opacity', 0.1)
        .attr('stroke', colors[aircraftIndex])
        .attr('stroke-width', 2);

      // Add points
      g.selectAll(`.point-${aircraftIndex}`)
        .data(radarData.slice(0, -1))
        .join('circle')
        .attr('class', `point-${aircraftIndex}`)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 3)
        .attr('fill', colors[aircraftIndex]);
    });

  }, [selectedAircraft]);

  // Stream Graph for Time Series
  useEffect(() => {
    if (!streamRef.current) return;

    const container = d3.select(streamRef.current);
    container.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for stream graph
    const regions = ['North America', 'Europe', 'Asia', 'Middle East', 'Oceania'];
    
    const stack = d3.stack()
      .keys(regions)
      .offset(d3.stackOffsetSilhouette);

    const layers = stack(timeSeriesData);

    const xScale = d3.scaleBand()
      .domain(timeSeriesData.map(d => d.month))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(layers.flat().flat()))
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(regions)
      .range(['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']);

    const area = d3.area()
      .x((d, i) => xScale(timeSeriesData[i].month) + xScale.bandwidth() / 2)
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis);

    // Draw layers
    g.selectAll('.layer')
      .data(layers)
      .join('path')
      .attr('class', 'layer')
      .attr('d', area)
      .attr('fill', (d, i) => colorScale(regions[i]))
      .attr('opacity', 0.8);

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#ffffff');

  }, []);

  // Sunburst Chart for Hierarchical Data
  useEffect(() => {
    if (!sunburstRef.current) return;

    const container = d3.select(sunburstRef.current);
    container.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const svg = container
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)');

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create hierarchical data
    const hierarchyData = {
      name: 'Aviation Network',
      children: []
    };

    // Group by regions
    const regionGroups = d3.group(airports, d => d.region);
    regionGroups.forEach((airportsInRegion, region) => {
      const regionNode = {
        name: region,
        children: []
      };

      airportsInRegion.forEach(airport => {
        const airportRoutes = routes.filter(r => r.source === airport.id);
        const totalPassengers = airportRoutes.reduce((sum, r) => sum + r.passengers, 0);
        
        regionNode.children.push({
          name: airport.id,
          value: totalPassengers || airport.volume / 10000
        });
      });

      hierarchyData.children.push(regionNode);
    });

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const partition = d3.partition()
      .size([2 * Math.PI, radius]);

    partition(root);

    const colorScale = d3.scaleOrdinal()
      .domain(['North America', 'Europe', 'Asia', 'Middle East', 'Oceania'])
      .range(['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']);

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1);

    g.selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => {
        if (d.depth === 1) return colorScale(d.data.name);
        return d3.color(colorScale(d.parent.data.name)).darker(0.5);
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .attr('opacity', d => d.depth === 1 ? 0.8 : 0.6);

    // Add labels for major segments
    g.selectAll('text')
      .data(root.descendants().filter(d => d.depth === 1 && d.x1 - d.x0 > 0.5))
      .join('text')
      .attr('transform', d => {
        const angle = (d.x0 + d.x1) / 2;
        const r = (d.y0 + d.y1) / 2;
        return `rotate(${angle * 180 / Math.PI - 90}) translate(${r},0) rotate(${angle > Math.PI ? 180 : 0})`;
      })
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 + d.x1) / 2 > Math.PI ? 'end' : 'start')
      .attr('fill', '#ffffff')
      .attr('font-family', 'SF Pro Display, system-ui, sans-serif')
      .attr('font-size', '10px')
      .text(d => d.data.name);

  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Advanced D3.js Aviation Analytics
              </h1>
              <p className="text-gray-300">Interactive Multi-Dimensional Data Visualization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Regions</option>
              <option value="North America">North America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Middle East">Middle East</option>
              <option value="Oceania">Oceania</option>
            </select>
            
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value="frequency">Flight Frequency</option>
              <option value="passengers">Passenger Volume</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
        </div>

        {/* Main Visualizations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Network Force Simulation */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <Network className="w-5 h-5 mr-2 text-blue-400" />
                Airport Network Force Simulation
              </h3>
              <p className="text-sm text-gray-400 mt-1">Interactive force-directed graph • Drag nodes to explore connections</p>
            </div>
            <div className="p-4">
              <div ref={networkRef}></div>
            </div>
          </div>

          {/* Sankey Flow Diagram */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                Regional Aircraft Flow (Sankey)
              </h3>
              <p className="text-sm text-gray-400 mt-1">Passenger flow from regions to aircraft types</p>
            </div>
            <div className="p-4">
              <div ref={sankeyRef}></div>
            </div>
          </div>
        </div>

        {/* Secondary Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Heatmap */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-400" />
                Efficiency vs Volume Heatmap
              </h3>
              <p className="text-sm text-gray-400 mt-1">Airport performance correlation</p>
            </div>
            <div className="p-4">
              <div ref={heatmapRef}></div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Aircraft Performance Radar
              </h3>
              <p className="text-sm text-gray-400 mt-1">Multi-metric performance comparison</p>
            </div>
            <div className="p-4">
              <div ref={radarRef}></div>
            </div>
          </div>

          {/* Sunburst Chart */}
          <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center">
                <Globe2 className="w-5 h-5 mr-2 text-purple-400" />
                Hierarchical Network Sunburst
              </h3>
              <p className="text-sm text-gray-400 mt-1">Regional airport distribution</p>
            </div>
            <div className="p-4">
              <div ref={sunburstRef}></div>
            </div>
          </div>
        </div>

        {/* Stream Graph */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-cyan-400" />
              Regional Passenger Flow Stream Graph
            </h3>
            <p className="text-sm text-gray-400 mt-1">Time series visualization of passenger volume by region</p>
          </div>
          <div className="p-4">
            <div ref={streamRef}></div>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 rounded-xl border border-blue-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Total Airports</p>
                <p className="text-2xl font-bold text-white">{airports.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-blue-200">Across {[...new Set(airports.map(a => a.region))].length} regions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 rounded-xl border border-green-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Total Routes</p>
                <p className="text-2xl font-bold text-white">{routes.length}</p>
              </div>
              <Network className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-200">Active connections worldwide</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl border border-purple-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Aircraft Types</p>
                <p className="text-2xl font-bold text-white">{aircraftData.length}</p>
              </div>
              <Plane className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-purple-200">Multiple categories analyzed</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-800/50 rounded-xl border border-yellow-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm">Total Passengers</p>
                <p className="text-2xl font-bold text-white">{Math.round(routes.reduce((sum, r) => sum + r.passengers, 0) / 1000000).toLocaleString()}M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-yellow-200">Annual volume estimate</p>
            </div>
          </div>
        </div>

        {/* Aircraft Fleet Analysis Table */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold flex items-center">
              <Plane className="w-6 h-6 mr-2" />
              Aircraft Fleet Performance Matrix
            </h3>
            <p className="text-gray-400 mt-1">Comprehensive analysis of aircraft specifications and efficiency metrics</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold">Aircraft Model</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Capacity</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Range (km)</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Fuel Efficiency</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Reliability</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold">Category</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold">Cost Index</th>
                </tr>
              </thead>
              <tbody>
                {aircraftData.map((aircraft, index) => (
                  <tr 
                    key={aircraft.model}
                    className={`border-b border-gray-700 hover:bg-gray-800/30 transition-all cursor-pointer ${
                      selectedAircraft?.model === aircraft.model ? 'bg-blue-900/30' : ''
                    }`}
                    onClick={() => setSelectedAircraft(selectedAircraft?.model === aircraft.model ? null : aircraft)}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-white">{aircraft.model}</div>
                        <div className="text-sm text-gray-400">{aircraft.manufacturer}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-white">{aircraft.capacity}</td>
                    <td className="py-4 px-6 text-right font-mono text-white">{aircraft.range.toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="font-mono text-white">{aircraft.fuelEfficiency}</span>
                        <div className="w-12 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(aircraft.fuelEfficiency / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="font-mono text-white">{aircraft.reliability}%</span>
                        <div className="w-12 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${aircraft.reliability}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        aircraft.category === 'Wide-body' ? 'bg-blue-900 text-blue-300' :
                        aircraft.category === 'Super-jumbo' ? 'bg-purple-900 text-purple-300' :
                        'bg-green-900 text-green-300'
                      }`}>
                        {aircraft.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-white">{aircraft.costIndex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm border-t border-gray-700 pt-6">
          <p>Advanced D3.js Data Visualization Dashboard</p>
          <p className="mt-1">Force Simulation • Sankey Diagrams • Heatmaps • Radar Charts • Stream Graphs • Sunburst Charts</p>
        </div>
      </div>
    </div>
  );
};

export default D3AviationDashboard;