import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Truck, 
  Construction, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Activity,
  Zap,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useDispatchSystem } from '../hooks/useDispatchSystem';
import { Excavator, Dumper } from '../types/dispatch';
import EnhancedManualDispatch from './EnhancedManualDispatch';
import { Toaster } from 'react-hot-toast';

const DispatchDashboard: React.FC = () => {
  const {
    excavators,
    dumpers,
    assignments,
    alerts,
    isOptimizing,
    optimizeAssignments,
    simulateBreakdown,
    acknowledgeAlert,
    manualAssign,
    removeAssignment,
    updateMaterial
  } = useDispatchSystem();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'breakdown': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getLoadStatusColor = (status: string) => {
    switch (status) {
      case 'loaded': return 'bg-green-500';
      case 'loading': return 'bg-blue-500';
      case 'dumping': return 'bg-orange-500';
      case 'empty': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const activeExcavators = excavators.filter(e => e.status === 'active').length;
  const idleExcavators = excavators.filter(e => e.status === 'idle').length;
  const activeDumpers = dumpers.filter(d => d.status === 'active').length;
  const idleDumpers = dumpers.filter(d => d.status === 'idle').length;

  return (
    <div className="min-h-screen bg-background p-6">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dynamic Dispatch System</h1>
            <p className="text-muted-foreground">Open Pit Mining Operations Control</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={optimizeAssignments}
              disabled={isOptimizing}
              className="bg-accent hover:bg-accent/90"
            >
              {isOptimizing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing ROM...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Optimize ROM Dispatch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Policy Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Dispatch Policy:</strong> Dynamic dispatch system handles ROM materials (Limestone & HGLS) automatically. 
            Waste and Development materials (Topsoil, OB, Screen Reject) are managed manually only through the Manual Control tab.
          </AlertDescription>
        </Alert>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-red-800">{alert.message}</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="ml-4"
                  >
                    Acknowledge
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Operations Overview
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manual Control & Algorithm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Excavators</CardTitle>
              <Construction className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeExcavators}</div>
              <p className="text-xs text-muted-foreground">
                {idleExcavators} idle • {excavators.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Dumpers</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{activeDumpers}</div>
              <p className="text-xs text-muted-foreground">
                {idleDumpers} idle • {dumpers.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Dynamic allocations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">87%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last shift
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Excavators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Construction className="w-5 h-5" />
                Excavators (PC1250)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {excavators.map((excavator) => (
                <div key={excavator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(excavator.status)}`} />
                    <div>
                      <div className="font-medium">{excavator.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {excavator.operator} • {excavator.location.zone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={excavator.status === 'active' ? 'default' : 'secondary'}>
                      {excavator.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {excavator.status === 'idle' ? (
                        <span className="text-yellow-600">Idle: {excavator.idleTime}min</span>
                      ) : (
                        <span>Material: {excavator.currentMaterial}</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => simulateBreakdown(excavator.id)}
                    className="ml-2"
                  >
                    Simulate Issue
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dumpers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Dumpers (HD465)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dumpers.map((dumper) => (
                <div key={dumper.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(dumper.status)}`} />
                    <div>
                      <div className="font-medium">{dumper.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {dumper.operator} • {dumper.location.zone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`${getLoadStatusColor(dumper.loadStatus)} text-white border-none`}
                    >
                      {dumper.loadStatus}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {dumper.assignedExcavator ? (
                        <span>→ {dumper.assignedExcavator}</span>
                      ) : (
                        <span className="text-yellow-600">Wait: {dumper.waitTime}min</span>
                      )}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => simulateBreakdown(dumper.id)}
                    className="ml-2"
                  >
                    Simulate Issue
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Real-time Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-time Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Mines Blast Area</span>
                </div>
                <div className="text-sm text-green-600 mt-1">
                  PC1250-1, PC1250-4, PC1250-6 active
                </div>
                <div className="text-xs text-green-500 mt-1">
                  Limestone & OB extraction
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">HGLS Stockyards</span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  PC1250-2 active, PC1250-5 maintenance
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  HGLS & Topsoil handling
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Screen Reject Area</span>
                </div>
                <div className="text-sm text-yellow-600 mt-1">
                  PC1250-3 idle (12min)
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  Screen reject processing
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-800">
                  <Construction className="w-4 h-4" />
                  <span className="font-medium">Processing Plants</span>
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  Crusher 1 & 2 operational
                </div>
                <div className="text-xs text-purple-500 mt-1">
                  {activeDumpers} dumpers in cycle
                </div>
              </div>
            </div>
            
            {/* Material Flow Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">Limestone</div>
                <div className="text-sm text-gray-600">→ Crusher 1</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">HGLS</div>
                <div className="text-sm text-gray-600">→ Crusher 2</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">Screen Reject</div>
                <div className="text-sm text-gray-600">→ Dumpyard</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">OB</div>
                <div className="text-sm text-gray-600">→ Dumpyard</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">Topsoil</div>
                <div className="text-sm text-gray-600">→ Mines Area</div>
              </div>
            </div>
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <EnhancedManualDispatch
              excavators={excavators}
              dumpers={dumpers}
              assignments={assignments}
              onManualAssign={manualAssign}
              onRemoveAssignment={removeAssignment}
              onUpdateMaterial={updateMaterial}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DispatchDashboard;