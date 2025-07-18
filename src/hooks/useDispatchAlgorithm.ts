import { Excavator, Dumper, Assignment, MaterialType } from '../types/dispatch';

export interface DispatchSuggestion {
  id: string;
  excavatorId: string;
  dumperId: string;
  priority: number;
  reason: string;
  estimatedCycleTime: number;
  efficiency: number;
  distance: number;
}

export interface AlgorithmMetrics {
  totalEfficiency: number;
  avgCycleTime: number;
  idleTimeReduction: number;
  fuelSavings: number;
}

export class DispatchAlgorithm {
  private static calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    // Simplified distance calculation (in km)
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static calculateTravelTime(distance: number, avgSpeed: number = 25): number {
    // Average speed in km/h for mining trucks
    return (distance / avgSpeed) * 60; // Convert to minutes
  }

  private static calculateEfficiency(
    excavator: Excavator,
    dumper: Dumper,
    distance: number
  ): number {
    const travelTime = this.calculateTravelTime(distance);
    const loadingTime = excavator.loadCapacity / excavator.cycleRate; // Minutes to load
    const totalCycleTime = travelTime * 2 + loadingTime + 3; // 3 min dumping time
    
    // Efficiency based on capacity utilization and cycle time
    const capacityUtilization = Math.min(dumper.loadCapacity / excavator.loadCapacity, 1);
    const timeEfficiency = 1 / (totalCycleTime / 60); // Cycles per hour
    
    return capacityUtilization * timeEfficiency * 100;
  }

  private static getMaterialPriority(material: MaterialType): number {
    const priorities = {
      'limestone': 100, // Highest priority - revenue generating
      'hgls': 90,      // High grade limestone - second priority
      // Note: topsoil, ob, and screen_reject are handled manually only
    };
    return priorities[material] || 0; // Return 0 for manual-only materials
  }

  private static getDestinationForMaterial(material: MaterialType): string {
    const destinations = {
      'limestone': 'Crusher 1',
      'hgls': 'Crusher 2',
      'topsoil': 'Stockpile',
      'waste': 'Waste Dump'
    };
    return destinations[material] || 'Unknown';
  }

  public static generateOptimalAssignments(
    excavators: Excavator[],
    dumpers: Dumper[]
  ): DispatchSuggestion[] {
    const suggestions: DispatchSuggestion[] = [];
    
    // Filter available equipment - EXCLUDE waste and topsoil from automated dispatch
    const availableExcavators = excavators.filter(exc => 
      (exc.status === 'active' || (exc.status === 'idle' && exc.idleTime > 2)) &&
      exc.currentMaterial !== 'topsoil' && 
      exc.currentMaterial !== 'ob' && 
      exc.currentMaterial !== 'screen_reject'
    );
    
    const availableDumpers = dumpers.filter(dump => 
      dump.status === 'idle' || 
      dump.waitTime > 3 || 
      !dump.assignedExcavator
    );

    // Generate all possible combinations
    availableExcavators.forEach(excavator => {
      availableDumpers.forEach(dumper => {
        const distance = this.calculateDistance(
          excavator.location,
          dumper.location
        );
        
        const efficiency = this.calculateEfficiency(excavator, dumper, distance);
        const materialPriority = this.getMaterialPriority(excavator.currentMaterial);
        const travelTime = this.calculateTravelTime(distance);
        const loadingTime = excavator.loadCapacity / excavator.cycleRate;
        const estimatedCycleTime = travelTime * 2 + loadingTime + 3;
        
        // Calculate priority score
        let priority = efficiency * 0.4 + materialPriority * 0.3;
        
        // Bonus for reducing idle time
        if (excavator.status === 'idle') {
          priority += excavator.idleTime * 2;
        }
        
        if (dumper.waitTime > 0) {
          priority += dumper.waitTime * 1.5;
        }
        
        // Penalty for long distances
        priority -= distance * 5;
        
        // Bonus for material compatibility
        if (dumper.material === excavator.currentMaterial) {
          priority += 20;
        }

        const suggestion: DispatchSuggestion = {
          id: `${excavator.id}_${dumper.id}_${Date.now()}`,
          excavatorId: excavator.id,
          dumperId: dumper.id,
          priority: Math.max(0, priority),
          reason: this.generateReason(excavator, dumper, distance, efficiency),
          estimatedCycleTime,
          efficiency,
          distance
        };
        
        suggestions.push(suggestion);
      });
    });

    // Sort by priority and remove conflicts
    const sortedSuggestions = suggestions.sort((a, b) => b.priority - a.priority);
    const finalSuggestions: DispatchSuggestion[] = [];
    const usedExcavators = new Set<string>();
    const usedDumpers = new Set<string>();

    sortedSuggestions.forEach(suggestion => {
      if (!usedExcavators.has(suggestion.excavatorId) && 
          !usedDumpers.has(suggestion.dumperId)) {
        finalSuggestions.push(suggestion);
        usedExcavators.add(suggestion.excavatorId);
        usedDumpers.add(suggestion.dumperId);
      }
    });

    return finalSuggestions.slice(0, 10); // Return top 10 suggestions
  }

  private static generateReason(
    excavator: Excavator,
    dumper: Dumper,
    distance: number,
    efficiency: number
  ): string {
    const reasons = [];
    
    if (excavator.status === 'idle' && excavator.idleTime > 5) {
      reasons.push(`Excavator idle for ${excavator.idleTime}min`);
    }
    
    if (dumper.waitTime > 5) {
      reasons.push(`Dumper waiting ${dumper.waitTime}min`);
    }
    
    if (distance < 2) {
      reasons.push('Close proximity');
    }
    
    if (efficiency > 80) {
      reasons.push('High efficiency match');
    }
    
    if (excavator.currentMaterial === 'limestone') {
      reasons.push('Priority material');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'Standard assignment';
  }

  public static calculateMetrics(
    excavators: Excavator[],
    dumpers: Dumper[],
    assignments: Assignment[]
  ): AlgorithmMetrics {
    const totalEquipment = excavators.length + dumpers.length;
    const activeEquipment = excavators.filter(e => e.status === 'active').length + 
                           dumpers.filter(d => d.status === 'active').length;
    
    const totalEfficiency = (activeEquipment / totalEquipment) * 100;
    
    const avgCycleTime = [...excavators, ...dumpers]
      .filter(eq => eq.cycleTime)
      .reduce((sum, eq) => sum + (eq.cycleTime || 0), 0) / 
      [...excavators, ...dumpers].filter(eq => eq.cycleTime).length;
    
    const totalIdleTime = excavators.reduce((sum, exc) => sum + exc.idleTime, 0) +
                         dumpers.reduce((sum, dump) => sum + dump.waitTime, 0);
    
    const idleTimeReduction = Math.max(0, 100 - (totalIdleTime / totalEquipment));
    
    // Estimate fuel savings based on reduced idle time and optimized routes
    const fuelSavings = (idleTimeReduction / 100) * 15; // Up to 15% fuel savings
    
    return {
      totalEfficiency,
      avgCycleTime: avgCycleTime || 0,
      idleTimeReduction,
      fuelSavings
    };
  }

  public static validateAssignment(
    excavator: Excavator,
    dumper: Dumper
  ): { valid: boolean; reason?: string } {
    if (excavator.status === 'breakdown') {
      return { valid: false, reason: 'Excavator is broken down' };
    }
    
    if (dumper.status === 'breakdown') {
      return { valid: false, reason: 'Dumper is broken down' };
    }
    
    if (excavator.status === 'maintenance') {
      return { valid: false, reason: 'Excavator is under maintenance' };
    }
    
    if (dumper.status === 'maintenance') {
      return { valid: false, reason: 'Dumper is under maintenance' };
    }
    
    // Check if dumper capacity is suitable for excavator
    if (dumper.loadCapacity && excavator.loadCapacity && 
        dumper.loadCapacity < excavator.loadCapacity * 0.8) {
      return { valid: false, reason: 'Dumper capacity too small for excavator' };
    }
    
    return { valid: true };
  }
}