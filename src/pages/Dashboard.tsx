import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Briefcase, Video, FolderOpen, TrendingUp, LogOut } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'CV Score', value: '95%', icon: FileText, color: 'text-primary' },
    { label: 'Job Matches', value: '12', icon: Briefcase, color: 'text-accent' },
    { label: 'Interviews Done', value: '8', icon: Video, color: 'text-primary' },
    { label: 'Documents', value: '24', icon: FolderOpen, color: 'text-accent' },
  ];

  const quickActions = [
    { label: 'Build CV', icon: FileText, href: '#' },
    { label: 'Find Jobs', icon: Briefcase, href: '#' },
    { label: 'Practice Interview', icon: Video, href: '#' },
    { label: 'View Documents', icon: FolderOpen, href: '#' },
    { label: 'Market Insights', icon: TrendingUp, href: '#' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Dashboard Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CareerMate Dashboard
            </h1>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2">Welcome back, User! 👋</h2>
          <p className="text-muted-foreground text-lg">
            Here's an overview of your career progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-muted rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary"
                    asChild
                  >
                    <a href={action.href}>
                      <Icon className="w-6 h-6" />
                      <span className="text-sm">{action.label}</span>
                    </a>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-semibold mb-1">Software Engineer</h4>
                    <p className="text-sm text-muted-foreground mb-2">Tech Company • Jakarta</p>
                    <div className="flex gap-2">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">95% Match</span>
                      <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">Remote</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interview Practice History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Behavioral Interview</h4>
                      <span className="text-sm text-muted-foreground">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-gradient-success h-2 rounded-full" style={{ width: `${85 + i * 5}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-accent">{85 + i * 5}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
