import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, TrendingUp, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface CVIssue {
  id: string;
  category: 'critical' | 'improvement' | 'keyword';
  title: string;
  description: string;
  originalText: string;
  suggestedText: string;
  section: string;
  fixed: boolean;
}

const CVMateDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const fileName = location.state?.fileName || 'your-cv.pdf';
  const fileUrl = location.state?.fileUrl || '';
  const fileType = location.state?.fileType || '';

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [cvContent, setCvContent] = useState({
    name: 'John Anderson',
    title: 'Senior Produc Manger', // intentional typo
    email: 'john.anderson@email.com',
    phone: '+1 (555) 123-4567',
    summary: 'Experinced product manager with 8+ years leading cross-functional teams.', // typo
    experience: [
      {
        id: 'exp1',
        company: 'Tech Solutions Inc.',
        role: 'Product Manajer', // typo
        period: '2020 - Present',
        description: 'Led product development initiatives for cloud-based solutions.'
      }
    ],
    skills: ['Project Managment', 'Data Analisys', 'Agile'] // typos
  });

  const [issues, setIssues] = useState<CVIssue[]>([
    {
      id: '1',
      category: 'critical',
      title: 'Typo in Job Title',
      description: 'Critical spelling error in your main headline',
      originalText: 'Produc Manger',
      suggestedText: 'Product Manager',
      section: 'header',
      fixed: false
    },
    {
      id: '2',
      category: 'critical',
      title: 'Typo in Summary',
      description: 'Spelling error affects professionalism',
      originalText: 'Experinced',
      suggestedText: 'Experienced',
      section: 'summary',
      fixed: false
    },
    {
      id: '3',
      category: 'improvement',
      title: 'Experience Section Typo',
      description: 'Position title contains spelling error',
      originalText: 'Product Manajer',
      suggestedText: 'Product Manager',
      section: 'experience',
      fixed: false
    },
    {
      id: '4',
      category: 'improvement',
      title: 'Skills Section Typos',
      description: 'Multiple spelling errors in skills',
      originalText: 'Project Managment, Data Analisys',
      suggestedText: 'Project Management, Data Analysis',
      section: 'skills',
      fixed: false
    },
    {
      id: '5',
      category: 'keyword',
      title: 'Missing ATS Keywords',
      description: 'Add industry-relevant keywords',
      originalText: '',
      suggestedText: 'Add: Product Strategy, Stakeholder Management, KPI Optimization',
      section: 'skills',
      fixed: false
    }
  ]);

  const sectionRefs = {
    header: useRef<HTMLDivElement>(null),
    summary: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null)
  };

  const score = Math.round((issues.filter(i => i.fixed).length / issues.length) * 100);

  const handleIssueClick = (issue: CVIssue) => {
    setSelectedIssue(issue.id);
    
    // Scroll to the relevant section
    const ref = sectionRefs[issue.section as keyof typeof sectionRefs];
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFixIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    // Update CV content based on issue
    if (issue.id === '1') {
      setCvContent(prev => ({ ...prev, title: issue.suggestedText }));
    } else if (issue.id === '2') {
      setCvContent(prev => ({ 
        ...prev, 
        summary: prev.summary.replace('Experinced', 'Experienced')
      }));
    } else if (issue.id === '3') {
      setCvContent(prev => ({
        ...prev,
        experience: prev.experience.map(exp => 
          exp.id === 'exp1' ? { ...exp, role: 'Product Manager' } : exp
        )
      }));
    } else if (issue.id === '4') {
      setCvContent(prev => ({
        ...prev,
        skills: ['Project Management', 'Data Analysis', 'Agile']
      }));
    } else if (issue.id === '5') {
      setCvContent(prev => ({
        ...prev,
        skills: [...prev.skills, 'Product Strategy', 'Stakeholder Management', 'KPI Optimization']
      }));
    }

    // Mark issue as fixed
    setIssues(prev => prev.map(i => 
      i.id === issueId ? { ...i, fixed: true } : i
    ));

    // Clear highlight after animation
    setTimeout(() => {
      if (selectedIssue === issueId) {
        setSelectedIssue(null);
      }
    }, 2000);
  };

  const handleBackClick = () => {
    const hasProgress = issues.some(i => i.fixed);
    if (hasProgress) {
      const confirmLeave = window.confirm('Progress Anda mungkin hilang. Yakin ingin kembali?');
      if (!confirmLeave) return;
    }
    
    // Clean up the blob URL
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    // Navigate back to upload page
    navigate('/cvmate');
  };

  const criticalIssues = issues.filter(i => i.category === 'critical' && !i.fixed);
  const improvementIssues = issues.filter(i => i.category === 'improvement' && !i.fixed);
  const keywordIssues = issues.filter(i => i.category === 'keyword' && !i.fixed);
  const fixedIssues = issues.filter(i => i.fixed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="font-medium">Upload Ulang</span>
            </Button>
            <Link 
              to="/"
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              CareerMate
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            Analyzing: {fileName}
          </div>
        </div>
      </header>

      {/* Split Screen Layout */}
      <div className="grid lg:grid-cols-[1fr,400px] h-[calc(100vh-73px)]">
        {/* Left: CV Viewer */}
        <div className="overflow-y-auto bg-muted/30 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-background rounded-lg shadow-2xl overflow-hidden"
          >
            {fileUrl ? (
              // Display actual uploaded file
              <div className="relative w-full h-[calc(100vh-200px)]">
                {fileType === 'application/pdf' ? (
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title="CV Preview"
                  />
                ) : fileType.startsWith('image/') ? (
                  <img
                    src={fileUrl}
                    alt="CV Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Preview not available for this file type</p>
                      <p className="text-sm text-muted-foreground mt-2">{fileName}</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay highlights for issues */}
                <AnimatePresence>
                  {selectedIssue && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {/* Position overlay based on selected issue */}
                      {selectedIssue === '1' && (
                        <motion.div
                          animate={{ 
                            boxShadow: issues.find(i => i.id === '1')?.fixed 
                              ? '0 0 0 4px rgba(34, 197, 94, 0.5)' 
                              : '0 0 0 4px rgba(239, 68, 68, 0.5)' 
                          }}
                          className="absolute top-[10%] left-[10%] right-[10%] h-[8%] rounded"
                        />
                      )}
                      {selectedIssue === '2' && (
                        <motion.div
                          animate={{ 
                            boxShadow: issues.find(i => i.id === '2')?.fixed 
                              ? '0 0 0 4px rgba(34, 197, 94, 0.5)' 
                              : '0 0 0 4px rgba(239, 68, 68, 0.5)' 
                          }}
                          className="absolute top-[20%] left-[10%] right-[10%] h-[12%] rounded"
                        />
                      )}
                      {selectedIssue === '3' && (
                        <motion.div
                          animate={{ 
                            boxShadow: issues.find(i => i.id === '3')?.fixed 
                              ? '0 0 0 4px rgba(34, 197, 94, 0.5)' 
                              : '0 0 0 4px rgba(234, 179, 8, 0.5)' 
                          }}
                          className="absolute top-[35%] left-[10%] right-[10%] h-[10%] rounded"
                        />
                      )}
                      {(selectedIssue === '4' || selectedIssue === '5') && (
                        <motion.div
                          animate={{ 
                            boxShadow: issues.find(i => i.id === selectedIssue)?.fixed 
                              ? '0 0 0 4px rgba(34, 197, 94, 0.5)' 
                              : '0 0 0 4px rgba(234, 179, 8, 0.5)' 
                          }}
                          className="absolute top-[50%] left-[10%] right-[10%] h-[15%] rounded"
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Fallback to mock CV if no file URL
              <div className="p-12 aspect-[1/1.414]">
                {/* Header Section */}
                <div 
                  ref={sectionRefs.header}
                  className={`mb-8 pb-6 border-b border-border relative transition-all duration-300 ${
                    selectedIssue === '1' 
                      ? issues.find(i => i.id === '1')?.fixed 
                        ? 'ring-4 ring-green-500/50 rounded-lg p-4 -m-4' 
                        : 'ring-4 ring-red-500/50 rounded-lg p-4 -m-4 animate-pulse'
                      : ''
                  }`}
                >
                  <motion.h1 
                    key={cvContent.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-bold mb-2"
                  >
                    {cvContent.name}
                  </motion.h1>
                  <motion.h2 
                    key={cvContent.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl text-primary mb-4"
                  >
                    {cvContent.title}
                  </motion.h2>
                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span>{cvContent.email}</span>
                    <span>{cvContent.phone}</span>
                  </div>
                </div>

                {/* Summary Section */}
                <div 
                  ref={sectionRefs.summary}
                  className={`mb-8 relative transition-all duration-300 ${
                    selectedIssue === '2' 
                      ? issues.find(i => i.id === '2')?.fixed 
                        ? 'ring-4 ring-green-500/50 rounded-lg p-4 -m-4' 
                        : 'ring-4 ring-red-500/50 rounded-lg p-4 -m-4 animate-pulse'
                      : ''
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
                  <motion.p 
                    key={cvContent.summary}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-foreground/80"
                  >
                    {cvContent.summary}
                  </motion.p>
                </div>

                {/* Experience Section */}
                <div 
                  ref={sectionRefs.experience}
                  className={`mb-8 relative transition-all duration-300 ${
                    selectedIssue === '3' 
                      ? issues.find(i => i.id === '3')?.fixed 
                        ? 'ring-4 ring-green-500/50 rounded-lg p-4 -m-4' 
                        : 'ring-4 ring-red-500/50 rounded-lg p-4 -m-4 animate-pulse'
                      : ''
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-4">Professional Experience</h3>
                  {cvContent.experience.map((exp) => (
                    <motion.div 
                      key={exp.id + exp.role}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{exp.period}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{exp.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Skills Section */}
                <div 
                  ref={sectionRefs.skills}
                  className={`relative transition-all duration-300 ${
                    selectedIssue === '4' || selectedIssue === '5'
                      ? issues.find(i => i.id === selectedIssue)?.fixed 
                        ? 'ring-4 ring-green-500/50 rounded-lg p-4 -m-4' 
                        : 'ring-4 ring-yellow-500/50 rounded-lg p-4 -m-4 animate-pulse'
                      : ''
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-3">Core Skills</h3>
                  <motion.div 
                    key={cvContent.skills.join(',')}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap gap-2"
                  >
                    {cvContent.skills.map((skill, idx) => (
                      <span 
                        key={skill + idx} 
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: AI Copilot Sidebar */}
        <div className="bg-background border-l border-border overflow-y-auto sticky top-0 h-[calc(100vh-73px)]">
          <div className="p-6 space-y-6">
            {/* Score Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500'}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '0 352' }}
                    animate={{ strokeDasharray: `${(score / 100) * 352} 352` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{score}</span>
                </div>
              </div>
              <h3 className="font-semibold mb-1">CV Health Score</h3>
              <p className="text-sm text-muted-foreground">
                {score >= 70 ? 'Great job!' : score >= 40 ? 'Needs improvement' : 'Critical issues found'}
              </p>
            </motion.div>

            {/* Critical Issues */}
            {criticalIssues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  Critical ({criticalIssues.length})
                </div>
                {criticalIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue}
                    isSelected={selectedIssue === issue.id}
                    onSelect={() => handleIssueClick(issue)}
                    onFix={() => handleFixIssue(issue.id)}
                  />
                ))}
              </div>
            )}

            {/* Improvements */}
            {improvementIssues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-500">
                  <TrendingUp className="h-4 w-4" />
                  Improvements ({improvementIssues.length})
                </div>
                {improvementIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue}
                    isSelected={selectedIssue === issue.id}
                    onSelect={() => handleIssueClick(issue)}
                    onFix={() => handleFixIssue(issue.id)}
                  />
                ))}
              </div>
            )}

            {/* Keywords */}
            {keywordIssues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
                  <Lightbulb className="h-4 w-4" />
                  Keywords ({keywordIssues.length})
                </div>
                {keywordIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id}
                    issue={issue}
                    isSelected={selectedIssue === issue.id}
                    onSelect={() => handleIssueClick(issue)}
                    onFix={() => handleFixIssue(issue.id)}
                  />
                ))}
              </div>
            )}

            {/* Fixed Issues */}
            {fixedIssues.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Fixed ({fixedIssues.length})
                </div>
                {fixedIssues.map((issue) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm line-through opacity-60">{issue.title}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* All Fixed CTA */}
            {issues.every(i => i.fixed) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-primary rounded-lg text-white text-center space-y-4"
              >
                <CheckCircle2 className="h-12 w-12 mx-auto" />
                <h3 className="font-bold text-xl">Perfect Score!</h3>
                <p className="text-sm opacity-90">Your CV is now ATS-optimized and ready to impress recruiters.</p>
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Choose Your Template <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface IssueCardProps {
  issue: CVIssue;
  isSelected: boolean;
  onSelect: () => void;
  onFix: () => void;
}

const IssueCard = ({ issue, isSelected, onSelect, onFix }: IssueCardProps) => {
  const categoryColors = {
    critical: 'border-red-500/30 bg-red-500/5',
    improvement: 'border-yellow-500/30 bg-yellow-500/5',
    keyword: 'border-blue-500/30 bg-blue-500/5'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        categoryColors[issue.category]
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-1">{issue.title}</h4>
          <p className="text-xs text-muted-foreground">{issue.description}</p>
        </div>

        {issue.originalText && (
          <div className="space-y-1 text-xs">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-[60px]">Current:</span>
              <span className="line-through text-red-500">{issue.originalText}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-[60px]">Suggested:</span>
              <span className="text-green-500 font-medium">{issue.suggestedText}</span>
            </div>
          </div>
        )}

        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFix();
          }}
          className="w-full bg-gradient-primary"
        >
          <Zap className="h-3 w-3 mr-2" />
          Auto-Fix
        </Button>
      </div>
    </motion.div>
  );
};

export default CVMateDashboard;
