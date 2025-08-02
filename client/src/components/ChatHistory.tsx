import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChatHistoryProps {
  currentSessionId: string;
}

export function ChatHistory({ currentSessionId }: ChatHistoryProps) {
  const dummySessions = [
    {
      id: '1',
      title: 'Production Analysis Q1',
      time: '2 hours ago',
      preview: 'Show me production trends for last 6 months',
      isActive: false
    },
    {
      id: '2', 
      title: 'Equipment Maintenance',
      time: '1 day ago',
      preview: 'Tell me about machine downtime issues',
      isActive: false
    },
    {
      id: '3',
      title: 'Quality Control Review',
      time: '3 days ago', 
      preview: 'Analysis of defective products',
      isActive: false
    },
    {
      id: '4',
      title: 'Efficiency Metrics',
      time: '1 week ago',
      preview: 'Production efficiency improvements',
      isActive: false
    },
    {
      id: '5',
      title: 'Current Session',
      time: 'Active now',
      preview: 'Manufacturing analytics session',
      isActive: true
    }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
          <i className="fas fa-history text-slate-600 mr-2"></i>
          Chat History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {dummySessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border-l-4 cursor-pointer transition-colors ${
                session.isActive 
                  ? 'bg-blue-50 border-blue-500 text-blue-900' 
                  : 'bg-white border-transparent text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm">{session.title}</h4>
                <span className="text-xs text-slate-500">{session.time}</span>
              </div>
              <p className="text-xs text-slate-600 truncate">{session.preview}</p>
              {session.isActive && (
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-xs text-green-600">Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}