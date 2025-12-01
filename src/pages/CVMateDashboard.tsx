import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, TrendingUp, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, Zap, FileText, X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

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
  const { toast } = useToast();
  const fileName = location.state?.fileName || 'your-cv.pdf';
  const fileUrl = location.state?.fileUrl || '';
  const fileType = location.state?.fileType || '';

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  
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

  const templates = [
    { 
      id: 'corporate',
      name: 'The Corporate', 
      type: 'ATS-Friendly',
      description: 'Classic serif, dense layout for banking/legal'
    },
    { 
      id: 'creative',
      name: 'The Creative', 
      type: 'Creative',
      description: 'Sidebar design with color accents'
    },
    { 
      id: 'minimalist',
      name: 'The Minimalist', 
      type: 'ATS-Friendly',
      description: 'Clean whitespace, modern sans-serif'
    },
    { 
      id: 'tech',
      name: 'The Tech', 
      type: 'Developer',
      description: 'Skills-focused with progress indicators'
    },
  ];

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowTemplateModal(true);
  };

  const handleDownloadPDF = async () => {
    if (!templateRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const opt = {
        margin: 0,
        filename: 'My_New_CV.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(templateRef.current).save();
      
      toast({
        title: "CV Berhasil Diunduh!",
        description: "Good luck with your job hunt! 🚀",
      });
    } catch (error) {
      toast({
        title: "Download Gagal",
        description: "Terjadi kesalahan saat mengunduh PDF. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

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
              // Show message if no file uploaded
              <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center bg-muted/50">
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No CV file uploaded</p>
                  <Button 
                    onClick={handleBackClick}
                    className="mt-4"
                  >
                    Upload CV
                  </Button>
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
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Template Selection Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Choose Your Perfect Template</h2>
            <p className="text-xl text-muted-foreground">Select a template to see your optimized CV in action</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group cursor-pointer"
                onClick={() => handleTemplateClick(template.id)}
              >
                <Card className="overflow-hidden h-[420px] relative shadow-lg hover:shadow-2xl transition-all">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-xs bg-background/95 backdrop-blur-sm text-foreground px-3 py-1 rounded-full border border-border/50 shadow-sm">
                      {template.type}
                    </span>
                  </div>

                  {/* Template Preview */}
                  {template.id === 'corporate' && (
                    <div className="h-full bg-background p-6">
                      <div className="text-center border-b-2 border-foreground pb-4 mb-4">
                        <div className="h-5 bg-foreground/90 rounded w-2/3 mx-auto mb-2" />
                        <div className="h-3 bg-foreground/50 rounded w-1/2 mx-auto" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="h-3 bg-foreground/80 rounded w-1/3 mb-2" />
                          <div className="space-y-1 pl-2">
                            <div className="h-2 bg-foreground/20 rounded w-full" />
                            <div className="h-2 bg-foreground/20 rounded w-11/12" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.id === 'creative' && (
                    <div className="h-full flex">
                      <div className="w-1/3 bg-primary p-4 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-background/90 mx-auto" />
                        <div className="space-y-2">
                          <div className="h-2 bg-background/70 rounded" />
                          <div className="h-2 bg-background/70 rounded w-4/5" />
                        </div>
                      </div>
                      <div className="flex-1 bg-background p-4 space-y-3">
                        <div className="h-4 bg-primary/80 rounded w-2/3" />
                        <div className="h-3 bg-foreground/30 rounded w-1/2" />
                      </div>
                    </div>
                  )}

                  {template.id === 'minimalist' && (
                    <div className="h-full bg-background p-8 space-y-6">
                      <div className="space-y-2">
                        <div className="h-6 bg-foreground/90 rounded w-1/2" />
                        <div className="h-3 bg-foreground/40 rounded w-1/3" />
                      </div>
                      <div className="h-px bg-foreground/20 my-6" />
                    </div>
                  )}

                  {template.id === 'tech' && (
                    <div className="h-full bg-background p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="h-4 bg-foreground/80 rounded w-2/3" />
                        <div className="h-3 bg-accent/60 rounded w-1/2" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <div className="px-2 py-1 bg-primary/20 rounded h-5 w-16" />
                        <div className="px-2 py-1 bg-primary/20 rounded h-5 w-14" />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Preview Template
                    </Button>
                  </div>
                </Card>

                <div className="mt-3 px-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Preview Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{templates.find(t => t.id === selectedTemplate)?.name} Template</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Ganti Template
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div ref={templateRef} className="mt-4">
            {selectedTemplate === 'corporate' && (
              <div className="bg-background p-12 border rounded-lg shadow-xl">
                <div className="text-center border-b-2 border-foreground pb-6 mb-6">
                  <h1 className="text-4xl font-serif font-bold mb-2">{cvContent.name}</h1>
                  <h2 className="text-xl text-primary">{cvContent.title}</h2>
                  <div className="flex justify-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{cvContent.email}</span>
                    <span>|</span>
                    <span>{cvContent.phone}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-serif font-bold mb-3 uppercase">Professional Summary</h3>
                    <p className="text-foreground/80 leading-relaxed">{cvContent.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-serif font-bold mb-3 uppercase">Experience</h3>
                    {cvContent.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="font-semibold">{exp.role}</div>
                        <div className="text-sm text-muted-foreground">{exp.company} | {exp.period}</div>
                        <p className="text-sm mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-serif font-bold mb-3 uppercase">Skills</h3>
                    <p className="text-foreground/80">{cvContent.skills.join(' • ')}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTemplate === 'creative' && (
              <div className="flex bg-background border rounded-lg shadow-xl overflow-hidden" style={{ minHeight: '800px' }}>
                <div className="w-1/3 bg-primary text-primary-foreground p-8 space-y-6">
                  <div className="w-32 h-32 rounded-full bg-background/90 mx-auto" />
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">{cvContent.name}</h1>
                    <p className="text-sm opacity-90">{cvContent.title}</p>
                  </div>
                  
                  <div className="pt-6 space-y-2 text-sm">
                    <div className="opacity-90">{cvContent.email}</div>
                    <div className="opacity-90">{cvContent.phone}</div>
                  </div>
                  
                  <div className="pt-6">
                    <h3 className="font-bold mb-3 text-lg">Skills</h3>
                    <div className="space-y-2">
                      {cvContent.skills.map((skill, idx) => (
                        <div key={idx} className="text-sm opacity-90">• {skill}</div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-primary">Professional Summary</h3>
                    <p className="text-foreground/80 leading-relaxed">{cvContent.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-primary">Professional Experience</h3>
                    {cvContent.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.role}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{exp.period}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTemplate === 'minimalist' && (
              <div className="bg-background p-16 border rounded-lg shadow-xl">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="space-y-3">
                    <h1 className="text-5xl font-light">{cvContent.name}</h1>
                    <h2 className="text-xl text-muted-foreground">{cvContent.title}</h2>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{cvContent.email}</span>
                      <span>{cvContent.phone}</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-foreground/60">Summary</h3>
                      <p className="text-foreground/80 leading-relaxed">{cvContent.summary}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-foreground/60">Experience</h3>
                      {cvContent.experience.map((exp) => (
                        <div key={exp.id} className="mb-6">
                          <div className="flex justify-between items-baseline mb-2">
                            <h4 className="font-medium">{exp.role}</h4>
                            <span className="text-sm text-muted-foreground">{exp.period}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{exp.company}</p>
                          <p className="text-sm text-foreground/80">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-foreground/60">Skills</h3>
                      <div className="flex flex-wrap gap-3">
                        {cvContent.skills.map((skill, idx) => (
                          <span key={idx} className="text-sm text-foreground/80">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTemplate === 'tech' && (
              <div className="bg-background p-12 border rounded-lg shadow-xl">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{cvContent.name}</h1>
                    <h2 className="text-xl text-accent font-medium">{cvContent.title}</h2>
                    <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
                      <span>{cvContent.email}</span>
                      <span>|</span>
                      <span>{cvContent.phone}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-accent rounded" />
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {cvContent.skills.map((skill, idx) => (
                        <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-accent rounded" />
                      Professional Summary
                    </h3>
                    <p className="text-foreground/80 leading-relaxed">{cvContent.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-accent rounded" />
                      Work Experience
                    </h3>
                    {cvContent.experience.map((exp) => (
                      <div key={exp.id} className="mb-4 pl-4 border-l-2 border-accent/30">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{exp.role}</h4>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                          </div>
                          <span className="text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded">{exp.period}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Next Step CTA */}
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-semibold text-lg mb-1">Siap Melamar Kerja?</h4>
                <p className="text-sm text-muted-foreground">Lihat lowongan yang cocok dengan CV baru Anda</p>
              </div>
              <Button 
                onClick={() => {
                  setShowTemplateModal(false);
                  navigate('/jobmate');
                }}
                size="lg"
                className="bg-gradient-primary gap-2"
              >
                Lihat 5 Lowongan yang Cocok
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
