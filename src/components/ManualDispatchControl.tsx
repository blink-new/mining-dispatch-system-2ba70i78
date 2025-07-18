import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Settings, 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Construction,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Excavator, Dumper, Assignment, MaterialType } from '../types/dispatch';
import { DispatchAlgorithm } from '../hooks/useDispatchAlgorithm';

interface ManualDispatchControlProps {
  excavators: Excavator[];
  dumpers: Dumper[];
  assignments: Assignment[];
  onManualAssign: (excavatorId: string, dumperId: string, material: MaterialType) => void;
  onRemoveAssignment: (assignmentId: string) => void;
  onUpdateMaterial: (excavatorId: string, material: MaterialType) => void;
}

const ManualDispatchControl: React.FC<ManualDispatchControlProps> = ({
  excavators,
  dumpers,
  assignments,
  onManualAssign,
  onRemoveAssignment,
  onUpdateMaterial
}) => {
  const [selectedExcavator, setSelectedExcavator] = useState<string>('');
  const [selectedDumper, setSelectedDumper] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>('limestone');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const suggestions = DispatchAlgorithm.generateOptimalAssignments(excavators, dumpers);
  const metrics = DispatchAlgorithm.calculateMetrics(excavators, dumpers, assignments);

  const handleManualAssign = () => {
    if (!selectedExcavator || !selectedDumper) {
      setValidationError('Please select both excavator and dumper');
      return;
    }

    const excavator = excavators.find(e => e.id === selectedExcavator);
    const dumper = dumpers.find(d => d.id === selectedDumper);

    if (!excavator || !dumper) {
      setValidationError('Selected equipment not found');
      return;
    }

    const validation = DispatchAlgorithm.validateAssignment(excavator, dumper);
    if (!validation.valid) {
      setValidationError(validation.reason || 'Invalid assignment');
      return;
    }

    onManualAssign(selectedExcavator, selectedDumper, selectedMaterial);
    setSelectedExcavator('');
    setSelectedDumper('');
    setValidationError('');
  };

  const handleSuggestionAccept = (suggestion: any) => {
    const excavator = excavators.find(e => e.id === suggestion.excavatorId);
    if (excavator) {
      onManualAssign(suggestion.excavatorId, suggestion.dumperId, excavator.currentMaterial);
    }
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

  const availableExcavators = excavators.filter(e => 
    e.status === 'active' || e.status === 'idle'
  );

  const availableDumpers = dumpers.filter(d => 
    d.status === 'active' || d.status === 'idle'
  );

  return (
    <div className="space-y-6">
      {/* Manual Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manual Dispatch Control
          </CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Excavator</label>
              <Select value={selectedExcavator} onValueChange={setSelectedExcavator}>
                <SelectTrigger>
                  <SelectValue placeholder="Select excavator" />
                </SelectTrigger>
                <SelectContent>
                  {availableExcavators.map((excavator) => (
                    <SelectItem key={excavator.id} value={excavator.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(excavator.status)}`} />
                        {excavator.id} - {excavator.location.zone}
                        {excavator.status === 'idle' && (
                          <span className="text-yellow-600 text-xs">({excavator.idleTime}min idle)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Dumper</label>
              <Select value={selectedDumper} onValueChange={setSelectedDumper}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dumper" />
                </SelectTrigger>
                <SelectContent>
                  {availableDumpers.map((dumper) => (
                    <SelectItem key={dumper.id} value={dumper.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(dumper.status)}`} />
                        {dumper.id} - {dumper.location.zone}
                        {dumper.waitTime > 0 && (
                          <span className="text-yellow-600 text-xs">({dumper.waitTime}min wait)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Material</label>
              <Select value={selectedMaterial} onValueChange={(value: MaterialType) => setSelectedMaterial(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limestone">Limestone</SelectItem>
                  <SelectItem value="hgls">HGLS</SelectItem>
                  <SelectItem value="screen_reject">Screen Reject</SelectItem>
                  <SelectItem value="ob">OB (Over Burden)</SelectItem>
                  <SelectItem value="topsoil">Topsoil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleManualAssign}
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!selectedExcavator || !selectedDumper}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Suggestions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Dispatch Suggestions
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              {showSuggestions ? 'Hide' : 'Show'} Suggestions
            </Button>
          </div>
        </CardHeader>
        {showSuggestions && (
          <CardContent>
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((suggestion) => {
                const excavator = excavators.find(e => e.id === suggestion.excavatorId);
                const dumper = dumpers.find(d => d.id === suggestion.dumperId);
                
                return (
                  <div key={suggestion.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Construction className="w-4 h-4 text-primary" />
                        <span className="font-medium">{suggestion.excavatorId}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="font-medium">{suggestion.dumperId}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="font-medium">Priority: {suggestion.priority.toFixed(0)}</div>
                        <div className="text-muted-foreground">
                          {suggestion.estimatedCycleTime.toFixed(1)}min cycle
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleSuggestionAccept(suggestion)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
              {suggestions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No optimization suggestions available at this time
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const excavator = excavators.find(e => e.id === assignment.excavatorId);
              const dumper = dumpers.find(d => d.id === assignment.dumperId);
              
              return (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                    <Badge variant="outline">
                      {assignment.material}
                    </Badge>
                    <Badge variant={assignment.priority === 'high' ? 'destructive' : 'secondary'}>
                      {assignment.priority}
                    </Badge>
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
            {assignments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No active assignments
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.totalEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Total Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.avgCycleTime.toFixed(1)}min
              </div>
              <div className="text-sm text-muted-foreground">Avg Cycle Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.idleTimeReduction.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Idle Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {metrics.fuelSavings.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Fuel Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Management */}
      <Card>
        <CardHeader>
          <CardTitle>Material Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {excavators.map((excavator) => (
              <div key={excavator.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Construction className="w-4 h-4 text-primary" />
                  <span className="font-medium">{excavator.id}</span>
                  <span className="text-sm text-muted-foreground">
                    {excavator.location.zone}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Current:</span>
                  <Badge variant="outline">{excavator.currentMaterial}</Badge>
                  <Select 
                    value={excavator.currentMaterial} 
                    onValueChange={(value: MaterialType) => onUpdateMaterial(excavator.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limestone">Limestone</SelectItem>
                      <SelectItem value="hgls">HGLS</SelectItem>
                      <SelectItem value="screen_reject">Screen Reject</SelectItem>
                      <SelectItem value="ob">OB (Over Burden)</SelectItem>
                      <SelectItem value="topsoil">Topsoil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualDispatchControl;