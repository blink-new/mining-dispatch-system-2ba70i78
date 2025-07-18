import { useState, useEffect, useCallback } from 'react';
import { Excavator, Dumper, Assignment, DispatchAlert, Zone, MaterialType } from '../types/dispatch';
import { toast } from 'react-hot-toast';
import { DispatchAlgorithm } from './useDispatchAlgorithm';

// Realistic mining equipment data
const mockExcavators: Excavator[] = [
  {
    id: 'PC1250-1',
    type: 'excavator',
    model: 'PC1250',
    status: 'active',
    location: { lat: 23.5204, lng: 87.3119, zone: 'Mines Blast Area' },
    operator: 'Rajesh Kumar',
    lastUpdate: new Date(),
    currentMaterial: 'limestone',
    loadingZone: 'Mines Blast Area',
    assignedDumpers: ['Dumper-1', 'Dumper-2'],
    idleTime: 0,
    cycleRate: 3.2,
    cycleTime: 3.2,
    loadCapacity: 6.0
  },
  {
    id: 'PC1250-2',
    type: 'excavator',
    model: 'PC1250',
    status: 'active',
    location: { lat: 23.5304, lng: 87.3219, zone: 'HGLS Stockyard 1' },
    operator: 'Suresh Patel',
    lastUpdate: new Date(),
    currentMaterial: 'hgls',
    loadingZone: 'HGLS Stockyard 1',
    assignedDumpers: ['Dumper-3', 'Dumper-4', 'Dumper-5'],
    idleTime: 0,
    cycleRate: 2.9,
    cycleTime: 2.9,
    loadCapacity: 6.0
  },
  {
    id: 'PC1250-3',
    type: 'excavator',
    model: 'PC1250',
    status: 'idle',
    location: { lat: 23.5404, lng: 87.3319, zone: 'Screen Reject Area' },
    operator: 'Amit Singh',
    lastUpdate: new Date(),
    currentMaterial: 'screen_reject',
    loadingZone: 'Screen Reject Area',
    assignedDumpers: ['Dumper-6'],
    idleTime: 12,
    cycleRate: 2.7,
    cycleTime: 2.7,
    loadCapacity: 6.0
  },
  {
    id: 'PC1250-4',
    type: 'excavator',
    model: 'PC1250',
    status: 'active',
    location: { lat: 23.5504, lng: 87.3419, zone: 'Mines Blast Area' },
    operator: 'Deepak Sharma',
    lastUpdate: new Date(),
    currentMaterial: 'ob',
    loadingZone: 'Mines Blast Area',
    assignedDumpers: ['Dumper-7', 'Dumper-8'],
    idleTime: 0,
    cycleRate: 3.1,
    cycleTime: 3.1,
    loadCapacity: 6.0
  },
  {
    id: 'PC1250-5',
    type: 'excavator',
    model: 'PC1250',
    status: 'maintenance',
    location: { lat: 23.5604, lng: 87.3519, zone: 'HGLS Stockyard 2' },
    operator: 'Vikram Yadav',
    lastUpdate: new Date(),
    currentMaterial: 'topsoil',
    loadingZone: 'HGLS Stockyard 2',
    assignedDumpers: [],
    idleTime: 0,
    cycleRate: 0,
    cycleTime: 0,
    loadCapacity: 6.0
  },
  {
    id: 'PC1250-6',
    type: 'excavator',
    model: 'PC1250',
    status: 'active',
    location: { lat: 23.5704, lng: 87.3619, zone: 'Mines Blast Area' },
    operator: 'Manoj Gupta',
    lastUpdate: new Date(),
    currentMaterial: 'limestone',
    loadingZone: 'Mines Blast Area',
    assignedDumpers: ['Dumper-9', 'Dumper-10'],
    idleTime: 0,
    cycleRate: 3.0,
    cycleTime: 3.0,
    loadCapacity: 6.0
  }
];

const mockDumpers: Dumper[] = [
  // Dumpers 1-5: Assigned to limestone operations
  {
    id: 'Dumper-1',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5154, lng: 87.3069, zone: 'Mines Blast Area' },
    operator: 'Ravi Sharma',
    lastUpdate: new Date(),
    loadStatus: 'loading',
    assignedExcavator: 'PC1250-1',
    destination: 'Crusher 1',
    material: 'limestone',
    eta: 12,
    waitTime: 0,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-2',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5254, lng: 87.3169, zone: 'Crusher 1' },
    operator: 'Santosh Kumar',
    lastUpdate: new Date(),
    loadStatus: 'dumping',
    assignedExcavator: 'PC1250-1',
    destination: 'Crusher 1',
    material: 'limestone',
    eta: 3,
    waitTime: 0,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-3',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5304, lng: 87.3219, zone: 'HGLS Stockyard 1' },
    operator: 'Prakash Singh',
    lastUpdate: new Date(),
    loadStatus: 'loading',
    assignedExcavator: 'PC1250-2',
    destination: 'Crusher 2',
    material: 'hgls',
    eta: 15,
    waitTime: 0,
    cycleTime: 20.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-4',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5354, lng: 87.3269, zone: 'Crusher 2' },
    operator: 'Mukesh Yadav',
    lastUpdate: new Date(),
    loadStatus: 'dumping',
    assignedExcavator: 'PC1250-2',
    destination: 'Crusher 2',
    material: 'hgls',
    eta: 2,
    waitTime: 0,
    cycleTime: 20.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-5',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5404, lng: 87.3319, zone: 'HGLS Stockyard 1' },
    operator: 'Dinesh Patel',
    lastUpdate: new Date(),
    loadStatus: 'loaded',
    assignedExcavator: 'PC1250-2',
    destination: 'Crusher 2',
    material: 'hgls',
    eta: 18,
    waitTime: 0,
    cycleTime: 20.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-6',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.5454, lng: 87.3369, zone: 'Screen Reject Area' },
    operator: 'Ramesh Gupta',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    assignedExcavator: 'PC1250-3',
    destination: 'Dumpyard',
    material: 'screen_reject',
    waitTime: 8,
    cycleTime: 16.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-7',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5504, lng: 87.3419, zone: 'Mines Blast Area' },
    operator: 'Sunil Kumar',
    lastUpdate: new Date(),
    loadStatus: 'loading',
    assignedExcavator: 'PC1250-4',
    destination: 'Dumpyard',
    material: 'ob',
    eta: 22,
    waitTime: 0,
    cycleTime: 25.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-8',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5554, lng: 87.3469, zone: 'Dumpyard' },
    operator: 'Anil Sharma',
    lastUpdate: new Date(),
    loadStatus: 'dumping',
    assignedExcavator: 'PC1250-4',
    destination: 'Dumpyard',
    material: 'ob',
    eta: 4,
    waitTime: 0,
    cycleTime: 25.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-9',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5704, lng: 87.3619, zone: 'Mines Blast Area' },
    operator: 'Vinod Singh',
    lastUpdate: new Date(),
    loadStatus: 'loading',
    assignedExcavator: 'PC1250-6',
    destination: 'Crusher 1',
    material: 'limestone',
    eta: 14,
    waitTime: 0,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-10',
    type: 'dumper',
    model: 'HD465',
    status: 'active',
    location: { lat: 23.5754, lng: 87.3669, zone: 'Crusher 1' },
    operator: 'Ashok Yadav',
    lastUpdate: new Date(),
    loadStatus: 'dumping',
    assignedExcavator: 'PC1250-6',
    destination: 'Crusher 1',
    material: 'limestone',
    eta: 6,
    waitTime: 0,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  // Dumpers 11-19: Available for assignment
  {
    id: 'Dumper-11',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.5804, lng: 87.3719, zone: 'Mines Area' },
    operator: 'Manoj Kumar',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 3,
    cycleTime: 19.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-12',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.5854, lng: 87.3769, zone: 'Mines Area' },
    operator: 'Rajesh Singh',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 5,
    cycleTime: 19.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-13',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.5904, lng: 87.3819, zone: 'Dumpyard' },
    operator: 'Sanjay Patel',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 7,
    cycleTime: 17.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-14',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.5954, lng: 87.3869, zone: 'Screen Reject Area' },
    operator: 'Deepak Kumar',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 2,
    cycleTime: 16.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-15',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.6004, lng: 87.3919, zone: 'HGLS Stockyard 2' },
    operator: 'Vikas Sharma',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 4,
    cycleTime: 21.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-16',
    type: 'dumper',
    model: 'HD465',
    status: 'maintenance',
    location: { lat: 23.6054, lng: 87.3969, zone: 'Mines Area' },
    operator: 'Ajay Singh',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 0,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-17',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.6104, lng: 87.4019, zone: 'Crusher 1' },
    operator: 'Naveen Kumar',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 6,
    cycleTime: 18.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-18',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.6154, lng: 87.4069, zone: 'Crusher 2' },
    operator: 'Rohit Patel',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 9,
    cycleTime: 20.0,
    loadCapacity: 40.0
  },
  {
    id: 'Dumper-19',
    type: 'dumper',
    model: 'HD465',
    status: 'idle',
    location: { lat: 23.6204, lng: 87.4119, zone: 'Dumpyard' },
    operator: 'Kiran Singh',
    lastUpdate: new Date(),
    loadStatus: 'empty',
    waitTime: 11,
    cycleTime: 17.0,
    loadCapacity: 40.0
  }
];

export const useDispatchSystem = () => {
  const [excavators, setExcavators] = useState<Excavator[]>(mockExcavators);
  const [dumpers, setDumpers] = useState<Dumper[]>(mockDumpers);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Advanced dispatch algorithm using AI optimization
  const optimizeAssignments = useCallback(() => {
    setIsOptimizing(true);
    
    try {
      // Generate optimal assignments using the algorithm
      const suggestions = DispatchAlgorithm.generateOptimalAssignments(excavators, dumpers);
      
      // Create alerts for idle excavators
      const idleExcavators = excavators.filter(exc => exc.status === 'idle' && exc.idleTime > 5);
      idleExcavators.forEach(excavator => {
        const alertId = `idle_exc_${excavator.id}_${Date.now()}`;
        const newAlert: DispatchAlert = {
          id: alertId,
          type: 'idle_excavator',
          severity: 'high',
          equipmentId: excavator.id,
          message: `Excavator ${excavator.id} has been idle for ${excavator.idleTime} minutes`,
          timestamp: new Date(),
          acknowledged: false
        };
        
        setAlerts(prev => [...prev.filter(a => a.equipmentId !== excavator.id), newAlert]);
      });

      // Auto-implement top suggestions (only for ROM materials - limestone and hgls)
      const autoImplement = suggestions.slice(0, 3).filter(s => {
        const excavator = excavators.find(e => e.id === s.excavatorId);
        return s.priority > 70 && excavator && 
               (excavator.currentMaterial === 'limestone' || excavator.currentMaterial === 'hgls');
      });
      
      autoImplement.forEach(suggestion => {
        const excavator = excavators.find(e => e.id === suggestion.excavatorId);
        const dumper = dumpers.find(d => d.id === suggestion.dumperId);
        
        if (excavator && dumper) {
          const validation = DispatchAlgorithm.validateAssignment(excavator, dumper);
          
          if (validation.valid) {
            const assignment: Assignment = {
              id: `auto_${Date.now()}_${suggestion.dumperId}`,
              dumperId: suggestion.dumperId,
              excavatorId: suggestion.excavatorId,
              priority: suggestion.priority > 90 ? 'high' : 'normal',
              status: 'assigned',
              createdAt: new Date(),
              material: excavator.currentMaterial,
              sourceZone: excavator.loadingZone,
              destinationZone: getDestinationForMaterial(excavator.currentMaterial)
            };
            
            setAssignments(prev => [...prev, assignment]);
            
            // Update equipment status
            setDumpers(prev => prev.map(d => 
              d.id === suggestion.dumperId 
                ? { ...d, assignedExcavator: suggestion.excavatorId, status: 'active', waitTime: 0, material: excavator.currentMaterial }
                : d
            ));
            
            setExcavators(prev => prev.map(e => 
              e.id === suggestion.excavatorId 
                ? { ...e, status: 'active', idleTime: 0, assignedDumpers: [...e.assignedDumpers.filter(id => id !== suggestion.dumperId), suggestion.dumperId] }
                : e
            ));
            
            toast.success(`Auto-assigned ${suggestion.dumperId} to ${suggestion.excavatorId} (Priority: ${suggestion.priority.toFixed(0)})`);
          }
        }
      });
      
    } catch (error) {
      console.error('Optimization error:', error);
      toast.error('Optimization failed');
    }
    
    setTimeout(() => setIsOptimizing(false), 1000);
  }, [excavators, dumpers]);

  const getDestinationForMaterial = (material: MaterialType): string => {
    const destinations = {
      'limestone': 'Crusher 1',
      'hgls': 'Crusher 2',
      'screen_reject': 'Dumpyard',
      'ob': 'Dumpyard',
      'topsoil': 'Mines Area'
    };
    return destinations[material] || 'Dumpyard';
  };

  // Simulate equipment breakdown
  const simulateBreakdown = useCallback((equipmentId: string) => {
    const isExcavator = excavators.some(e => e.id === equipmentId);
    
    if (isExcavator) {
      setExcavators(prev => prev.map(e => 
        e.id === equipmentId ? { ...e, status: 'breakdown' } : e
      ));
      
      // Reassign dumpers from broken excavator
      const brokenExcavator = excavators.find(e => e.id === equipmentId);
      if (brokenExcavator) {
        const affectedDumpers = dumpers.filter(d => d.assignedExcavator === equipmentId);
        const activeExcavators = excavators.filter(e => e.id !== equipmentId && e.status === 'active');
        
        affectedDumpers.forEach((dumper, index) => {
          const newExcavator = activeExcavators[index % activeExcavators.length];
          if (newExcavator) {
            setDumpers(prev => prev.map(d => 
              d.id === dumper.id 
                ? { ...d, assignedExcavator: newExcavator.id }
                : d
            ));
          }
        });
      }
    } else {
      setDumpers(prev => prev.map(d => 
        d.id === equipmentId ? { ...d, status: 'breakdown' } : d
      ));
    }
    
    const alert: DispatchAlert = {
      id: `breakdown_${equipmentId}_${Date.now()}`,
      type: 'breakdown',
      severity: 'high',
      equipmentId,
      message: `Equipment ${equipmentId} has broken down and needs immediate attention`,
      timestamp: new Date(),
      acknowledged: false
    };
    
    setAlerts(prev => [...prev, alert]);
    toast.error(`Equipment ${equipmentId} breakdown detected!`);
  }, [excavators, dumpers]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  }, []);

  // Enhanced manual assignment functions supporting multiple dumpers
  const manualAssign = useCallback((excavatorId: string, dumperIds: string[], material: MaterialType, sourceZone?: string, destinationZone?: string) => {
    const excavator = excavators.find(e => e.id === excavatorId);
    
    if (!excavator) {
      toast.error('Excavator not found');
      return;
    }

    // Validate all dumpers
    const validDumpers = dumperIds.map(id => dumpers.find(d => d.id === id)).filter(Boolean);
    
    if (validDumpers.length !== dumperIds.length) {
      toast.error('Some dumpers not found');
      return;
    }

    // Validate each assignment
    const invalidAssignments = validDumpers.filter(dumper => {
      const validation = DispatchAlgorithm.validateAssignment(excavator, dumper);
      return !validation.valid;
    });

    if (invalidAssignments.length > 0) {
      toast.error(`Invalid assignments for: ${invalidAssignments.map(d => d.id).join(', ')}`);
      return;
    }

    // Remove existing assignments for these dumpers
    setAssignments(prev => prev.filter(a => !dumperIds.includes(a.dumperId)));

    // Create new assignments for all dumpers
    const newAssignments: Assignment[] = dumperIds.map(dumperId => ({
      id: `manual_${Date.now()}_${dumperId}`,
      dumperId,
      excavatorId,
      priority: 'normal',
      status: 'assigned',
      createdAt: new Date(),
      material,
      sourceZone: sourceZone || excavator.loadingZone,
      destinationZone: destinationZone || getDestinationForMaterial(material)
    }));

    setAssignments(prev => [...prev, ...newAssignments]);

    // Update dumpers status
    setDumpers(prev => prev.map(d => 
      dumperIds.includes(d.id)
        ? { ...d, assignedExcavator: excavatorId, status: 'active', waitTime: 0, material }
        : d
    ));

    // Update excavator status and assigned dumpers
    setExcavators(prev => prev.map(e => 
      e.id === excavatorId 
        ? { 
            ...e, 
            status: 'active', 
            idleTime: 0, 
            assignedDumpers: [...e.assignedDumpers.filter(id => !dumperIds.includes(id)), ...dumperIds],
            currentMaterial: material
          }
        : e
    ));

    const dumperCount = dumperIds.length;
    toast.success(`Manually assigned ${dumperCount} dumper${dumperCount > 1 ? 's' : ''} to ${excavatorId}`);
  }, [excavators, dumpers]);

  // Legacy single dumper assignment for backward compatibility
  const manualAssignSingle = useCallback((excavatorId: string, dumperId: string, material: MaterialType) => {
    manualAssign(excavatorId, [dumperId], material);
  }, [manualAssign]);

  const removeAssignment = useCallback((assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    setAssignments(prev => prev.filter(a => a.id !== assignmentId));

    // Update dumper status
    setDumpers(prev => prev.map(d => 
      d.id === assignment.dumperId 
        ? { ...d, assignedExcavator: undefined, status: 'idle', material: undefined }
        : d
    ));

    // Update excavator assigned dumpers
    setExcavators(prev => prev.map(e => 
      e.id === assignment.excavatorId 
        ? { ...e, assignedDumpers: e.assignedDumpers.filter(id => id !== assignment.dumperId) }
        : e
    ));

    toast.success(`Removed assignment for ${assignment.dumperId}`);
  }, [assignments]);

  const updateMaterial = useCallback((excavatorId: string, material: MaterialType) => {
    setExcavators(prev => prev.map(e => 
      e.id === excavatorId 
        ? { ...e, currentMaterial: material }
        : e
    ));

    // Update assignments for this excavator
    setAssignments(prev => prev.map(a => 
      a.excavatorId === excavatorId 
        ? { ...a, material, destinationZone: getDestinationForMaterial(material) }
        : a
    ));

    // Update dumpers assigned to this excavator
    setDumpers(prev => prev.map(d => 
      d.assignedExcavator === excavatorId 
        ? { ...d, material }
        : d
    ));

    toast.success(`Updated ${excavatorId} material to ${material}`);
  }, []);

  // Auto-update system (simulate real-time GPS updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Update idle times
      setExcavators(prev => prev.map(exc => ({
        ...exc,
        idleTime: exc.status === 'idle' ? exc.idleTime + 1 : 0
      })));
      
      setDumpers(prev => prev.map(dump => ({
        ...dump,
        waitTime: dump.status === 'idle' ? dump.waitTime + 1 : Math.max(0, dump.waitTime - 1),
        eta: dump.eta ? Math.max(0, dump.eta - 1) : undefined
      })));
      
      // Auto-optimize every 30 seconds
      if (Date.now() % 30000 < 5000) {
        optimizeAssignments();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [optimizeAssignments]);

  return {
    excavators,
    dumpers,
    assignments,
    alerts: alerts.filter(a => !a.acknowledged),
    isOptimizing,
    optimizeAssignments,
    simulateBreakdown,
    acknowledgeAlert,
    manualAssign,
    manualAssignSingle,
    removeAssignment,
    updateMaterial
  };
};