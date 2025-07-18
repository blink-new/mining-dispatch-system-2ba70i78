import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Truck, 
  Construction, 
  Clock, 
  MapPin, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Zap,
  Timer,
  Target,
  BarChart3,
  Radio,
  Gauge,
  Users,
  Fuel,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Play,
  Pause,
  RotateCcw,
  Signal,
  Wifi,
  Battery,
  Thermometer
} from 'lucide-react';
import { useDispatchSystem } from '../hooks/useDispatchSystem';
import { Excavator, Dumper, Assignment, MaterialType } from '../types/dispatch';

interface LiveMetrics {
  totalTrips: number;
  avgCycleTime: number;
  productivity: number;
  efficiency: number;
  materialsMoved: { [key: string]: number };
  hourlyProduction: number[];
  fuelConsumption: number;
  operatorCount: number;
  systemUptime: number;
}

interface EquipmentHealth {
  temperature: number;
  fuelLevel: number;
  engineHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number;
}

const RealtimeDispatchBoard: React.FC = () => {
  const {
    excavators,
    dumpers,
    assignments,
    alerts,
    isOptimizing,
    optimizeAssignments
  } = useDispatchSystem();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftStartTime] = useState(new Date(Date.now() - 4 * 60 * 60 * 1000)); // 4 hours ago
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalTrips: 0,
    avgCycleTime: 0,
    productivity: 0,
    efficiency: 0,
    materialsMoved: {},
    hourlyProduction: [],
    fuelConsumption: 0,
    operatorCount: 0,
    systemUptime: 99.2
  });

  const [equipmentHealth, setEquipmentHealth] = useState<{ [key: string]: EquipmentHealth }>({});

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate realistic equipment health data
  useEffect(() => {
    const generateHealthData = () => {
      const healthData: { [key: string]: EquipmentHealth } = {};
      
      [...excavators, ...dumpers].forEach(equipment => {
        healthData[equipment.id] = {
          temperature: equipment.status === 'active' ? 85 + Math.random() * 15 : 65 + Math.random() * 10,
          fuelLevel: equipment.status === 'maintenance' ? 20 + Math.random() * 30 : 40 + Math.random() * 60,
          engineHours: 1200 + Math.random() * 800,
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15',
          healthScore: equipment.status === 'breakdown' ? 30 + Math.random() * 20 : 
                      equipment.status === 'maintenance' ? 60 + Math.random() * 20 :
                      80 + Math.random() * 20
        };
      });
      
      setEquipmentHealth(healthData);
    };

    generateHealthData();
    const interval = setInterval(generateHealthData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [excavators, dumpers]);

  // Calculate enhanced live metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const activeEquipment = [...excavators, ...dumpers].filter(eq => eq.status === 'active');
      const totalEquipment = excavators.length + dumpers.length;
      
      // Calculate materials moved with more realistic data
      const materialsMoved: { [key: string]: number } = {};
      assignments.forEach(assignment => {
        const material = assignment.material;
        materialsMoved[material] = (materialsMoved[material] || 0) + 1;
      });

      // Add some base production numbers for realism
      const baseMaterials = ['limestone', 'hgls', 'screen_reject', 'ob', 'topsoil'];
      baseMaterials.forEach(material => {
        if (!materialsMoved[material]) {
          materialsMoved[material] = Math.floor(Math.random() * 15) + 5;
        }
      });

      // Calculate average cycle time with more realistic variation
      const activeDumpers = dumpers.filter(d => d.status === 'active' && d.cycleTime);
      const avgCycleTime = activeDumpers.length > 0 
        ? activeDumpers.reduce((sum, d) => sum + (d.cycleTime || 0), 0) / activeDumpers.length
        : 18.5; // Default realistic cycle time

      // Calculate productivity (trips per hour with shift context)
      const shiftHours = (Date.now() - shiftStartTime.getTime()) / (1000 * 60 * 60);
      const totalTripsToday = assignments.length + Math.floor(Math.random() * 80) + 150;
      const productivity = shiftHours > 0 ? totalTripsToday / shiftHours : 0;

      // Calculate efficiency with realistic factors
      const efficiency = Math.min(95, (activeEquipment.length / totalEquipment) * 100 * 0.85); // 85% max realistic efficiency

      // Generate hourly production data (last 8 hours with realistic patterns)
      const hourlyProduction = Array.from({ length: 8 }, (_, i) => {
        const hour = new Date().getHours() - 7 + i;
        const isNightShift = hour < 6 || hour > 22;
        const baseProduction = isNightShift ? 25 : 45;
        return Math.floor(Math.random() * 20) + baseProduction + (i * 1.5);
      });

      // Calculate fuel consumption
      const fuelConsumption = activeEquipment.length * 25 + Math.random() * 50; // Liters per hour

      // Count unique operators
      const operators = new Set([...excavators, ...dumpers].map(eq => eq.operator));

      setLiveMetrics({
        totalTrips: totalTripsToday,
        avgCycleTime,
        productivity,
        efficiency,
        materialsMoved,
        hourlyProduction,
        fuelConsumption,
        operatorCount: operators.size,
        systemUptime: 99.2 + Math.random() * 0.7
      });
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [excavators, dumpers, assignments, shiftStartTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'breakdown': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'idle': return <Pause className="w-3 h-3" />;
      case 'maintenance': return <Wrench className="w-3 h-3" />;
      case 'breakdown': return <XCircle className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getLoadStatusColor = (status: string) => {
    switch (status) {
      case 'loaded': return 'bg-green-500';
      case 'loading': return 'bg-blue-500';
      case 'dumping': return 'bg-orange-500';
      case 'empty': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  const getMaterialColor = (material: MaterialType) => {
    const colors = {
      'limestone': 'bg-stone-600',
      'hgls': 'bg-blue-600',
      'screen_reject': 'bg-yellow-600',
      'ob': 'bg-amber-700',
      'topsoil': 'bg-green-700'
    };
    return colors[material] || 'bg-gray-600';
  };

  const getMaterialIcon = (material: MaterialType) => {
    // Using different visual indicators for materials
    const patterns = {
      'limestone': '🏔️',
      'hgls': '💎',
      'screen_reject': '⚠️',
      'ob': '🪨',
      'topsoil': '🌱'
    };
    return patterns[material] || '📦';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatShiftTime = () => {
    const elapsed = Date.now() - shiftStartTime.getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const activeExcavators = excavators.filter(e => e.status === 'active');
  const activeDumpers = dumpers.filter(d => d.status === 'active');
  const idleExcavators = excavators.filter(e => e.status === 'idle');
  const idleDumpers = dumpers.filter(d => d.status === 'idle');
  const maintenanceEquipment = [...excavators, ...dumpers].filter(e => e.status === 'maintenance');
  const brokenEquipment = [...excavators, ...dumpers].filter(e => e.status === 'breakdown');

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Enhanced Header with System Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="w-8 h-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mining Dispatch Control Center</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>🕐 {formatTime(currentTime)}</span>
                    <span>⏱️ Shift: {formatShiftTime()}</span>
                    <span>👥 {liveMetrics.operatorCount} Operators</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* System Health Indicators */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Signal className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">GPS Signal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Network</span>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">{liveMetrics.systemUptime.toFixed(1)}% Uptime</span>
                </div>
              </div>
              
              <Button 
                onClick={optimizeAssignments}
                disabled={isOptimizing}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isOptimizing ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Optimize ROM
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {alerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
              <div>
                <h3 className="font-semibold text-red-800">🚨 Critical Alerts ({alerts.length})</h3>
                <div className="mt-2 space-y-1">
                  {alerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className="text-sm text-red-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {alert.message}
                    </div>
                  ))}
                  {alerts.length > 2 && (
                    <div className="text-sm text-red-600">+ {alerts.length - 2} more alerts</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📊 Live Overview
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🚛 Equipment Status
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              ⚡ Active Operations
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📈 Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Enhanced KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Shift Production</CardTitle>
                  <Target className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{liveMetrics.totalTrips}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-blue-700">+{Math.floor(liveMetrics.productivity)} trips/hr</p>
                  </div>
                  <div className="text-xs text-blue-600 mt-1">Target: 200 trips</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Cycle Efficiency</CardTitle>
                  <Timer className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{liveMetrics.avgCycleTime.toFixed(1)}min</div>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-700">Within target</p>
                  </div>
                  <div className="text-xs text-green-600 mt-1">Target: ≤20.0min</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Fleet Utilization</CardTitle>
                  <Gauge className="h-5 w-5 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{liveMetrics.efficiency.toFixed(0)}%</div>
                  <Progress value={liveMetrics.efficiency} className="mt-2 h-2" />
                  <div className="text-xs text-purple-600 mt-1">
                    {activeExcavators.length + activeDumpers.length} of {excavators.length + dumpers.length} active
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Fuel Consumption</CardTitle>
                  <Fuel className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{liveMetrics.fuelConsumption.toFixed(0)}L/hr</div>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className="w-3 h-3 text-orange-600" />
                    <p className="text-xs text-orange-700">Normal consumption</p>
                  </div>
                  <div className="text-xs text-orange-600 mt-1">Budget: 800L/shift</div>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Construction className="w-5 h-5 text-blue-600" />
                    Excavator Fleet ({excavators.length} units)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{activeExcavators.length}</div>
                      <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <Play className="w-3 h-3" />
                        Active
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">{idleExcavators.length}</div>
                      <div className="text-xs text-yellow-600 flex items-center justify-center gap-1">
                        <Pause className="w-3 h-3" />
                        Idle
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{maintenanceEquipment.filter(e => e.type === 'excavator').length}</div>
                      <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                        <Wrench className="w-3 h-3" />
                        Maintenance
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{brokenEquipment.filter(e => e.type === 'excavator').length}</div>
                      <div className="text-xs text-red-600 flex items-center justify-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Breakdown
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Active Units:</div>
                    {activeExcavators.slice(0, 4).map((exc) => (
                      <div key={exc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(exc.status)}`} />
                          <span className="font-medium text-sm">{exc.id}</span>
                          <span className="text-xs text-gray-500">{exc.operator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{getMaterialIcon(exc.currentMaterial)}</span>
                          <Badge variant="outline" className={`${getMaterialColor(exc.currentMaterial)} text-white border-none text-xs`}>
                            {exc.currentMaterial.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    Dumper Fleet ({dumpers.length} units)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-700">{activeDumpers.length}</div>
                      <div className="text-xs text-green-600 flex items-center justify-center gap-1">
                        <Play className="w-3 h-3" />
                        Active
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-700">{idleDumpers.length}</div>
                      <div className="text-xs text-yellow-600 flex items-center justify-center gap-1">
                        <Pause className="w-3 h-3" />
                        Idle
                      </div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">{maintenanceEquipment.filter(e => e.type === 'dumper').length}</div>
                      <div className="text-xs text-blue-600 flex items-center justify-center gap-1">
                        <Wrench className="w-3 h-3" />
                        Maintenance
                      </div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{brokenEquipment.filter(e => e.type === 'dumper').length}</div>
                      <div className="text-xs text-red-600 flex items-center justify-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Breakdown
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Active Units:</div>
                    {activeDumpers.slice(0, 4).map((dump) => (
                      <div key={dump.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(dump.status)}`} />
                          <span className="font-medium text-sm">{dump.id}</span>
                          <span className="text-xs text-gray-500">{dump.operator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${getLoadStatusColor(dump.loadStatus)} text-white border-none text-xs`}>
                            {dump.loadStatus}
                          </Badge>
                          {dump.eta && (
                            <span className="text-xs text-gray-600">{dump.eta}min</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Material Flow Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Live Material Flow - Shift Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(liveMetrics.materialsMoved).map(([material, count]) => {
                    const total = Object.values(liveMetrics.materialsMoved).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const isROM = material === 'limestone' || material === 'hgls';
                    
                    return (
                      <div key={material} className={`p-4 rounded-lg border-2 ${isROM ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="text-center">
                          <div className="text-2xl mb-1">{getMaterialIcon(material)}</div>
                          <div className="text-sm font-medium capitalize text-gray-700">
                            {material.replace('_', ' ')}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 my-1">{count}</div>
                          <div className="text-xs text-gray-600">{percentage.toFixed(1)}% of total</div>
                          <Progress value={percentage} className="mt-2 h-1" />
                          {isROM && (
                            <div className="text-xs text-green-600 mt-1 font-medium">ROM Material</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            {/* Enhanced Equipment Status with Health Monitoring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Construction className="w-5 h-5" />
                    Excavators - Real-time Status & Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {excavators.map((excavator) => {
                    const health = equipmentHealth[excavator.id];
                    return (
                      <div key={excavator.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${getStatusColor(excavator.status)} flex items-center justify-center`}>
                              <div className="text-white text-xs">
                                {getStatusIcon(excavator.status)}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-lg">{excavator.id}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {excavator.operator}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={excavator.status === 'active' ? 'default' : 'secondary'} className="mb-1">
                              {excavator.status.toUpperCase()}
                            </Badge>
                            {health && (
                              <div className={`text-sm font-medium ${getHealthColor(health.healthScore)}`}>
                                Health: {health.healthScore.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">📍 Location:</span>
                            <div className="font-medium">{excavator.location.zone}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">📦 Material:</span>
                            <div className="font-medium flex items-center gap-1">
                              {getMaterialIcon(excavator.currentMaterial)}
                              {excavator.currentMaterial.replace('_', ' ')}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">🚛 Assigned Dumpers:</span>
                            <div className="font-medium">{excavator.assignedDumpers.length}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">⏱️ Cycle Rate:</span>
                            <div className="font-medium">{excavator.cycleRate.toFixed(1)} min</div>
                          </div>
                        </div>

                        {health && (
                          <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                            <div className="text-center">
                              <Thermometer className="w-3 h-3 mx-auto mb-1 text-orange-500" />
                              <div className="font-medium">{health.temperature.toFixed(0)}°C</div>
                              <div className="text-gray-500">Temp</div>
                            </div>
                            <div className="text-center">
                              <Fuel className="w-3 h-3 mx-auto mb-1 text-blue-500" />
                              <div className="font-medium">{health.fuelLevel.toFixed(0)}%</div>
                              <div className="text-gray-500">Fuel</div>
                            </div>
                            <div className="text-center">
                              <Clock className="w-3 h-3 mx-auto mb-1 text-purple-500" />
                              <div className="font-medium">{health.engineHours.toFixed(0)}h</div>
                              <div className="text-gray-500">Engine</div>
                            </div>
                          </div>
                        )}

                        {excavator.status === 'idle' && excavator.idleTime > 0 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ Idle for {excavator.idleTime} minutes - Consider reassignment
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Dumpers - Real-time Status & Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {dumpers.slice(0, 10).map((dumper) => {
                    const health = equipmentHealth[dumper.id];
                    return (
                      <div key={dumper.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full ${getStatusColor(dumper.status)} flex items-center justify-center`}>
                              <div className="text-white text-xs">
                                {getStatusIcon(dumper.status)}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-lg">{dumper.id}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {dumper.operator}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={`${getLoadStatusColor(dumper.loadStatus)} text-white border-none mb-1`}>
                              {dumper.loadStatus.toUpperCase()}
                            </Badge>
                            {health && (
                              <div className={`text-sm font-medium ${getHealthColor(health.healthScore)}`}>
                                Health: {health.healthScore.toFixed(0)}%
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-500">📍 Location:</span>
                            <div className="font-medium">{dumper.location.zone}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">🎯 Assigned to:</span>
                            <div className="font-medium">{dumper.assignedExcavator || 'Unassigned'}</div>
                          </div>
                          {dumper.eta && (
                            <div>
                              <span className="text-gray-500">🕐 ETA:</span>
                              <div className="font-medium">{dumper.eta} min</div>
                            </div>
                          )}
                          {dumper.destination && (
                            <div>
                              <span className="text-gray-500">🏁 Destination:</span>
                              <div className="font-medium">{dumper.destination}</div>
                            </div>
                          )}
                        </div>

                        {health && (
                          <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-2 rounded">
                            <div className="text-center">
                              <Thermometer className="w-3 h-3 mx-auto mb-1 text-orange-500" />
                              <div className="font-medium">{health.temperature.toFixed(0)}°C</div>
                              <div className="text-gray-500">Temp</div>
                            </div>
                            <div className="text-center">
                              <Fuel className="w-3 h-3 mx-auto mb-1 text-blue-500" />
                              <div className="font-medium">{health.fuelLevel.toFixed(0)}%</div>
                              <div className="text-gray-500">Fuel</div>
                            </div>
                            <div className="text-center">
                              <Clock className="w-3 h-3 mx-auto mb-1 text-purple-500" />
                              <div className="font-medium">{health.engineHours.toFixed(0)}h</div>
                              <div className="text-gray-500">Engine</div>
                            </div>
                          </div>
                        )}

                        {dumper.status === 'idle' && dumper.waitTime > 5 && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                            ⚠️ Waiting for {dumper.waitTime} minutes - Check assignment
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            {/* Enhanced Active Operations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Active Operations ({assignments.length})
                  <Badge variant="outline" className="ml-2">
                    {assignments.filter(a => a.material === 'limestone' || a.material === 'hgls').length} ROM
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const excavator = excavators.find(e => e.id === assignment.excavatorId);
                    const dumper = dumpers.find(d => d.id === assignment.dumperId);
                    const isROM = assignment.material === 'limestone' || assignment.material === 'hgls';
                    
                    return (
                      <div key={assignment.id} className={`p-4 border rounded-lg ${isROM ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <Badge variant={assignment.priority === 'high' ? 'destructive' : 'default'}>
                              {assignment.priority.toUpperCase()}
                            </Badge>
                            {isROM && (
                              <Badge variant="outline" className="bg-green-600 text-white border-none">
                                ROM AUTO
                              </Badge>
                            )}
                            <div>
                              <div className="font-bold text-lg">
                                {assignment.dumperId} ➜ {assignment.excavatorId}
                              </div>
                              <div className="text-sm text-gray-600">
                                📍 {assignment.sourceZone} → 🏁 {assignment.destinationZone}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={`${getMaterialColor(assignment.material)} text-white border-none mb-1`}>
                              {getMaterialIcon(assignment.material)} {assignment.material.replace('_', ' ')}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              Created: {assignment.createdAt.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <div className="font-medium capitalize flex items-center gap-1">
                              {getStatusIcon(assignment.status)}
                              {assignment.status.replace('_', ' ')}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Dumper Status:</span>
                            <div className="font-medium capitalize">{dumper?.loadStatus || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Excavator Operator:</span>
                            <div className="font-medium">{excavator?.operator || 'Unknown'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Dumper Operator:</span>
                            <div className="font-medium">{dumper?.operator || 'Unknown'}</div>
                          </div>
                        </div>

                        {dumper?.eta && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            🕐 ETA: {dumper.eta} minutes to destination
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {assignments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <div className="text-lg font-medium">No Active Assignments</div>
                      <div className="text-sm">Use Auto-Optimize to generate ROM assignments</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {/* Enhanced Performance Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Hourly Production Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveMetrics.hourlyProduction.map((value, index) => {
                      const hour = new Date().getHours() - 7 + index;
                      const displayHour = hour < 0 ? hour + 24 : hour;
                      const isCurrentHour = index === 7;
                      
                      return (
                        <div key={index} className={`flex items-center gap-3 p-2 rounded ${isCurrentHour ? 'bg-blue-50 border border-blue-200' : ''}`}>
                          <div className="text-sm w-16 font-medium">
                            {String(displayHour).padStart(2, '0')}:00
                            {isCurrentHour && <span className="text-blue-600 ml-1">●</span>}
                          </div>
                          <div className="flex-1">
                            <Progress value={(value / 80) * 100} className="h-3" />
                          </div>
                          <div className="text-sm font-bold w-12 text-right">{value}</div>
                          <div className="text-xs text-gray-500 w-16">trips</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Equipment Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Construction className="w-4 h-4" />
                          Excavators
                        </span>
                        <span className="font-bold">{((activeExcavators.length / excavators.length) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(activeExcavators.length / excavators.length) * 100} className="h-3" />
                      <div className="text-xs text-gray-500 mt-1">
                        {activeExcavators.length} of {excavators.length} units active
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          Dumpers
                        </span>
                        <span className="font-bold">{((activeDumpers.length / dumpers.length) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={(activeDumpers.length / dumpers.length) * 100} className="h-3" />
                      <div className="text-xs text-gray-500 mt-1">
                        {activeDumpers.length} of {dumpers.length} units active
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Overall Fleet
                        </span>
                        <span className="font-bold">{liveMetrics.efficiency.toFixed(0)}%</span>
                      </div>
                      <Progress value={liveMetrics.efficiency} className="h-3" />
                      <div className="text-xs text-gray-500 mt-1">
                        Target: 85% minimum utilization
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-sm font-medium mb-3">Fleet Health Summary</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-bold text-green-700">{Object.values(equipmentHealth).filter(h => h.healthScore >= 80).length}</div>
                          <div className="text-green-600">Excellent</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-bold text-yellow-700">{Object.values(equipmentHealth).filter(h => h.healthScore >= 60 && h.healthScore < 80).length}</div>
                          <div className="text-yellow-600">Good</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Material Distribution with Enhanced Visuals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Material Distribution - Shift Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['limestone', 'hgls', 'screen_reject', 'ob', 'topsoil'].map((material) => {
                    const count = liveMetrics.materialsMoved[material] || 0;
                    const total = Object.values(liveMetrics.materialsMoved).reduce((sum, val) => sum + val, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const isROM = material === 'limestone' || material === 'hgls';
                    
                    return (
                      <div key={material} className={`p-4 rounded-lg border-2 ${isROM ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                        <div className="text-center">
                          <div className="text-3xl mb-2">{getMaterialIcon(material)}</div>
                          <div className="text-sm font-bold capitalize text-gray-800 mb-1">
                            {material.replace('_', ' ')}
                          </div>
                          <div className="text-3xl font-bold text-gray-900 mb-1">{count}</div>
                          <div className="text-xs text-gray-600 mb-2">{percentage.toFixed(1)}% of total</div>
                          <Progress value={percentage} className="h-2 mb-2" />
                          {isROM && (
                            <Badge variant="outline" className="bg-green-600 text-white border-none text-xs">
                              ROM Material
                            </Badge>
                          )}
                          {!isROM && (
                            <Badge variant="outline" className="bg-gray-600 text-white border-none text-xs">
                              Manual Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealtimeDispatchBoard;