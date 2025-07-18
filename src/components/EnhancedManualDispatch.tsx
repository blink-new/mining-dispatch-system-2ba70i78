import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { 
  Settings, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Construction,
  AlertTriangle,
  Zap,
  Plus,
  Users,
  MapPin,
  Package,
  Target
} from 'lucide-react';
import { Excavator, Dumper, Assignment, MaterialType, TaskCategory, MATERIAL_ROUTES } from '../types/dispatch';

interface EnhancedManualDispatchProps {
  excavators: Excavator[];
  dumpers: Dumper[];
  assignments: Assignment[];
  onManualAssign: (excavatorId: string, dumperIds: string[], material: MaterialType, sourceZone: string, destinationZone: string) => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onUpdateMaterial: (excavatorId: string, material: MaterialType) => void;
}

const EnhancedManualDispatch: React.FC<EnhancedManualDispatchProps> = ({
  excavators,
  dumpers,
  assignments,
  onManualAssign,
  onRemoveAssignment,
  onUpdateMaterial
}) => {
  const [selectedExcavator, setSelectedExcavator] = useState<string>('');
  const [selectedDumpers, setSelectedDumpers] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('limestone');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('ROM');
  const [validationError, setValidationError] = useState<string>('');
  const [showMultiAssign, setShowMultiAssign] = useState(false);

  const currentRoute = MATERIAL_ROUTES.find(route => route.material === selectedMaterial);
  
  const handleMaterialChange = (material: MaterialType) => {
    setSelectedMaterial(material);
    const route = MATERIAL_ROUTES.find(r => r.material === material);
    if (route) {
      setSelectedCategory(route.category);
      setSelectedSource(route.sources[0] || '');
      setSelectedDestination(route.destinations[0] || '');
    }
  };

  const handleDumperToggle = (dumperId: string) => {
    setSelectedDumpers(prev => 
      prev.includes(dumperId) 
        ? prev.filter(id => id !== dumperId)
        : [...prev, dumperId]
    );
  };

  const handleMultiAssign = () => {
    if (!selectedExcavator || selectedDumpers.length === 0) {
      setValidationError('Please select excavator and at least one dumper');
      return;
    }

    if (!selectedSource || !selectedDestination) {
      setValidationError('Please select source and destination zones');
      return;
    }

    const excavator = excavators.find(e => e.id === selectedExcavator);
    if (!excavator) {
      setValidationError('Selected excavator not found');
      return;
    }

    // Validate each dumper
    const invalidDumpers = selectedDumpers.filter(dumperId => {
      const dumper = dumpers.find(d => d.id === dumperId);
      return !dumper || (dumper.status !== 'active' && dumper.status !== 'idle');
    });

    if (invalidDumpers.length > 0) {
      setValidationError(`Invalid dumpers: ${invalidDumpers.join(', ')}`);
      return;
    }

    onManualAssign(selectedExcavator, selectedDumpers, selectedMaterial, selectedSource, selectedDestination);
    
    // Reset form
    setSelectedExcavator('');
    setSelectedDumpers([]);
    setSelectedSource('');
    setSelectedDestination('');
    setValidationError('');
    setShowMultiAssign(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-blue-500';
      case 'breakdown': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'ROM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Waste': return 'bg-red-100 text-red-800 border-red-200';
      case 'Development': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const availableExcavators = excavators.filter(e => 
    e.status === 'active' || e.status === 'idle'
  );

  const availableDumpers = dumpers.filter(d => 
    d.status === 'active' || d.status === 'idle'
  );

  const getExcavatorAssignedDumpers = (excavatorId: string) => {
    return assignments
      .filter(a => a.excavatorId === excavatorId)
      .map(a => a.dumperId);
  };

  return (
    <div className="space-y-6">
      {/* Material-Based Task Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Task Categories & Material Routes
          </CardTitle>
          <Alert className="border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Dynamic Dispatch Policy:</strong> Only ROM materials (Limestone & HGLS) are handled by automated dispatch. 
              Waste and Development materials (Topsoil, OB, Screen Reject) are managed manually only.
            </AlertDescription>
          </Alert>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['ROM', 'Waste', 'Development'].map((category) => {
              const categoryRoutes = MATERIAL_ROUTES.filter(route => route.category === category);
              return (
                <Card key={category} className={`border-2 ${category !== 'ROM' ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge className={getCategoryColor(category as TaskCategory)}>
                        {category}
                      </Badge>
                      {category !== 'ROM' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Manual Only
                        </Badge>
                      )}
                      {category === 'ROM' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          Auto + Manual
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {categoryRoutes.map((route) => (
                      <div key={route.material} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm mb-2">{route.material.toUpperCase()}</div>
                        <div className="text-xs text-gray-600 mb-2">{route.description}</div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span className="font-medium">Sources:</span>
                            <span className="text-gray-600">{route.sources.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Target className="w-3 h-3" />
                            <span className="font-medium">Destinations:</span>
                            <span className="text-gray-600">{route.destinations.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Manual Assignment Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Enhanced Manual Dispatch Control
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowMultiAssign(!showMultiAssign)}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {showMultiAssign ? 'Simple Mode' : 'Multi-Dumper Mode'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {validationError}
              </AlertDescription>
            </Alert>
          )}

          {/* Material Selection First */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">Task Category & Material</label>
              <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_ROUTES.map((route) => (
                    <SelectItem key={route.material} value={route.material}>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(route.category)} variant="outline">
                          {route.category}
                        </Badge>
                        {route.material.toUpperCase()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentRoute && (
                <div className="text-xs text-gray-600 mt-1">{currentRoute.description}</div>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Source Zone</label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentRoute?.sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Destination Zone</label>
                <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentRoute?.destinations.map((destination) => (
                      <SelectItem key={destination} value={destination}>
                        {destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excavator Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Excavator</label>
              <Select value={selectedExcavator} onValueChange={setSelectedExcavator}>
                <SelectTrigger>
                  <SelectValue placeholder="Select excavator" />
                </SelectTrigger>
                <SelectContent>
                  {availableExcavators.map((excavator) => {
                    const assignedCount = getExcavatorAssignedDumpers(excavator.id).length;
                    return (
                      <SelectItem key={excavator.id} value={excavator.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(excavator.status)}`} />
                          <span>{excavator.id}</span>
                          <span className="text-xs text-gray-500">({excavator.location.zone})</span>
                          {assignedCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {assignedCount} dumpers
                            </Badge>
                          )}
                          {excavator.status === 'idle' && (
                            <span className="text-yellow-600 text-xs">({excavator.idleTime}min idle)</span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Dumper Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Dumper{showMultiAssign ? 's' : ''} 
                {showMultiAssign && selectedDumpers.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDumpers.length} selected
                  </Badge>
                )}
              </label>
              
              {!showMultiAssign ? (
                <Select 
                  value={selectedDumpers[0] || ''} 
                  onValueChange={(value) => setSelectedDumpers(value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dumper" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDumpers.map((dumper) => (
                      <SelectItem key={dumper.id} value={dumper.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(dumper.status)}`} />
                          <span>{dumper.id}</span>
                          <span className="text-xs text-gray-500">({dumper.location.zone})</span>
                          {dumper.waitTime > 0 && (
                            <span className="text-yellow-600 text-xs">({dumper.waitTime}min wait)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {availableDumpers.map((dumper) => (
                      <div key={dumper.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={dumper.id}
                          checked={selectedDumpers.includes(dumper.id)}
                          onCheckedChange={() => handleDumperToggle(dumper.id)}
                        />
                        <label htmlFor={dumper.id} className="flex items-center gap-2 cursor-pointer flex-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(dumper.status)}`} />
                          <span className="font-medium">{dumper.id}</span>
                          <span className="text-xs text-gray-500">({dumper.location.zone})</span>
                          {dumper.waitTime > 0 && (
                            <span className="text-yellow-600 text-xs">({dumper.waitTime}min wait)</span>
                          )}
                          {dumper.assignedExcavator && (
                            <Badge variant="outline" className="text-xs">
                              Assigned to {dumper.assignedExcavator}
                            </Badge>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleMultiAssign}
              className="bg-accent hover:bg-accent/90 flex items-center gap-2"
              disabled={!selectedExcavator || selectedDumpers.length === 0}
            >
              {showMultiAssign ? <Users className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              Assign {selectedDumpers.length > 1 ? `${selectedDumpers.length} Dumpers` : 'Dumper'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments with Enhanced Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Active Assignments by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {['ROM', 'Waste', 'Development'].map((category) => {
            const categoryAssignments = assignments.filter(assignment => {
              const route = MATERIAL_ROUTES.find(r => r.material === assignment.material);
              return route?.category === category;
            });

            if (categoryAssignments.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getCategoryColor(category as TaskCategory)}>
                    {category}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {categoryAssignments.length} active assignment{categoryAssignments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {categoryAssignments.map((assignment) => {
                    const excavator = excavators.find(e => e.id === assignment.excavatorId);
                    const dumper = dumpers.find(d => d.id === assignment.dumperId);
                    
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Construction className="w-4 h-4 text-primary" />
                            <span className="font-medium">{assignment.excavatorId}</span>
                            <span className="text-sm text-muted-foreground">
                              ({excavator?.location.zone})
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            <span className="font-medium">{assignment.dumperId}</span>
                            <span className="text-sm text-muted-foreground">
                              ({dumper?.location.zone})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{assignment.material}</Badge>
                            <Badge variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}>
                              {assignment.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>{assignment.sourceZone} → {assignment.destinationZone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(assignment.createdAt).toLocaleTimeString()}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onRemoveAssignment(assignment.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active assignments
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excavator Status with Multi-Dumper Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="w-5 h-5" />
            Excavator Status & Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {excavators.map((excavator) => {
              const assignedDumperIds = getExcavatorAssignedDumpers(excavator.id);
              const assignedDumpers = assignedDumperIds.map(id => dumpers.find(d => d.id === id)).filter(Boolean);
              
              return (
                <div key={excavator.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(excavator.status)}`} />
                      <span className="font-medium text-lg">{excavator.id}</span>
                      <Badge variant="outline">{excavator.location.zone}</Badge>
                      <Badge variant="secondary">{excavator.currentMaterial}</Badge>
                      {excavator.status === 'idle' && excavator.idleTime > 0 && (
                        <Badge variant="destructive">Idle {excavator.idleTime}min</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Material:</span>
                      <Select 
                        value={excavator.currentMaterial} 
                        onValueChange={(value: MaterialType) => onUpdateMaterial(excavator.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MATERIAL_ROUTES.map((route) => (
                            <SelectItem key={route.material} value={route.material}>
                              {route.material.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {assignedDumpers.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Assigned Dumpers ({assignedDumpers.length}):
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {assignedDumpers.map((dumper) => (
                          <div key={dumper?.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Truck className="w-4 h-4 text-primary" />
                            <span className="font-medium">{dumper?.id}</span>
                            <span className="text-xs text-gray-500">({dumper?.location.zone})</span>
                            <Badge variant="outline" className="text-xs">
                              {dumper?.loadStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {assignedDumpers.length === 0 && (
                    <div className="text-sm text-gray-500 italic">No dumpers assigned</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedManualDispatch;