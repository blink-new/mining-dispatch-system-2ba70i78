export interface Equipment {
  id: string;
  type: 'excavator' | 'dumper';
  model: string;
  status: 'active' | 'idle' | 'maintenance' | 'breakdown';
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  operator: string;
  lastUpdate: Date;
  cycleTime?: number;
  loadCapacity?: number;
}

export interface Excavator extends Equipment {
  type: 'excavator';
  model: 'PC1250';
  currentMaterial: MaterialType;
  loadingZone: string;
  assignedDumpers: string[];
  idleTime: number;
  cycleRate: number;
}

export interface Dumper extends Equipment {
  type: 'dumper';
  model: 'HD465';
  loadStatus: 'empty' | 'loaded' | 'loading' | 'dumping';
  assignedExcavator?: string;
  destination?: string;
  material?: MaterialType;
  eta?: number;
  waitTime: number;
}

export type MaterialType = 'limestone' | 'hgls' | 'screen_reject' | 'ob' | 'topsoil';

export type TaskCategory = 'ROM' | 'Waste' | 'Development';

export interface MaterialRoute {
  material: MaterialType;
  category: TaskCategory;
  sources: string[];
  destinations: string[];
  description: string;
}

export const MATERIAL_ROUTES: MaterialRoute[] = [
  {
    material: 'limestone',
    category: 'ROM',
    sources: ['Mines Blast Area X', 'Mines Blast Area Y', 'Mines Blast Area Z'],
    destinations: ['Crusher 1', 'Crusher 2'],
    description: 'ROM (Run of Mine) - Limestone to Crusher'
  },
  {
    material: 'hgls',
    category: 'ROM',
    sources: ['HGLS Stockyard 1', 'HGLS Stockyard 2'],
    destinations: ['Crusher 1', 'Crusher 2'],
    description: 'ROM - HGLS Material to Crusher'
  },
  {
    material: 'topsoil',
    category: 'Development',
    sources: ['Fixed Topsoil Area'],
    destinations: ['Dumpyard', 'Mines Area'],
    description: 'Development - Topsoil for bund creation'
  },
  {
    material: 'ob',
    category: 'Waste',
    sources: ['Mines Blast Area X', 'Mines Blast Area Y', 'Mines Blast Area Z'],
    destinations: ['Dumpyard', 'Mines Area'],
    description: 'Waste - Overburden to Dumpyard'
  },
  {
    material: 'screen_reject',
    category: 'Waste',
    sources: ['Screen Reject Area'],
    destinations: ['Dumpyard'],
    description: 'Waste - Screen Reject to Dumpyard'
  }
];

export interface Zone {
  id: string;
  name: string;
  type: 'loading' | 'dumping';
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentLoad: number;
  materials: MaterialType[];
}

export interface Assignment {
  id: string;
  dumperId: string;
  excavatorId: string;
  priority: 'high' | 'normal' | 'low';
  status: 'assigned' | 'in_progress' | 'completed';
  createdAt: Date;
  estimatedCompletion?: Date;
  material: MaterialType;
  sourceZone: string;
  destinationZone: string;
}

export interface DispatchAlert {
  id: string;
  type: 'idle_excavator' | 'idle_dumper' | 'breakdown' | 'reroute_suggestion';
  severity: 'high' | 'medium' | 'low';
  equipmentId: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface PerformanceMetrics {
  totalTrips: number;
  avgCycleTime: number;
  equipmentUtilization: number;
  idleTime: number;
  productivity: number;
  fuelEfficiency: number;
}