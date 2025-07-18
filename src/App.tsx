import React, { useState } from 'react';
import DispatchDashboard from './components/DispatchDashboard';
import RealtimeDispatchBoard from './components/RealtimeDispatchBoard';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { 
  Activity, 
  Radio, 
  BarChart3,
  Settings
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'realtime'>('realtime');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-bold text-primary">Dynamic Dispatch System</h1>
                <p className="text-sm text-muted-foreground">Open Pit Mining Operations</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={currentView === 'realtime' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('realtime')}
                  className="flex items-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  Real-time Board
                </Button>
                <Button
                  variant={currentView === 'dashboard' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Control Dashboard
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-0">
        {currentView === 'realtime' ? (
          <RealtimeDispatchBoard />
        ) : (
          <DispatchDashboard />
        )}
      </div>
    </div>
  );
}

export default App;