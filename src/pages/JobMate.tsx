import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, MapPin, DollarSign, Building2, Zap, CheckCircle2, Send, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  role: string;
  company: string;
  logo: string;
  location: string;
  salary: string;
  type: 'Remote' | 'Onsite' | 'Hybrid';
  matchScore: number;
  requiredSkills: string[];
  description: string;
  aiInsight: string;
}

const JOB_DATA: Job[] = [
  {
    id: '1',
    role: 'Senior Frontend Developer',
    company: 'TechStart Indonesia',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TI',
    location: 'Jakarta, Indonesia',
    salary: 'Rp 15-25 juta/bulan',
    type: 'Remote',
    matchScore: 96,
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
    description: 'Mencari developer berpengalaman untuk membangun aplikasi web modern dengan tech stack terkini.',
    aiInsight: 'CV Anda mengandung keyword: React, Tailwind yang dicari perusahaan ini.'
  },
  {
    id: '2',
    role: 'UI/UX Designer',
    company: 'Creative Studio',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CS',
    location: 'Bandung, Indonesia',
    salary: 'Rp 12-18 juta/bulan',
    type: 'Hybrid',
    matchScore: 92,
    requiredSkills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    description: 'Bergabunglah dengan tim kreatif kami untuk merancang pengalaman digital yang luar biasa.',
    aiInsight: 'Pengalaman UI/UX Anda sangat cocok dengan kebutuhan posisi ini.'
  },
  {
    id: '3',
    role: 'Full Stack Developer',
    company: 'Digital Solutions',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DS',
    location: 'Surabaya, Indonesia',
    salary: 'Rp 18-28 juta/bulan',
    type: 'Remote',
    matchScore: 94,
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    description: 'Membangun solusi digital end-to-end untuk klien enterprise kami.',
    aiInsight: 'Kombinasi skill frontend dan backend Anda sangat dibutuhkan.'
  },
  {
    id: '4',
    role: 'Product Manager',
    company: 'Innovation Labs',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=IL',
    location: 'Jakarta, Indonesia',
    salary: 'Rp 20-30 juta/bulan',
    type: 'Onsite',
    matchScore: 78,
    requiredSkills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership'],
    description: 'Memimpin pengembangan produk inovatif yang mengubah industri.',
    aiInsight: 'Pengalaman project management Anda relevan untuk role ini.'
  },
  {
    id: '5',
    role: 'DevOps Engineer',
    company: 'Cloud Native Co',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CN',
    location: 'Remote',
    salary: 'Rp 16-24 juta/bulan',
    type: 'Remote',
    matchScore: 85,
    requiredSkills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
    description: 'Mengelola infrastruktur cloud dan automation untuk startup yang sedang berkembang pesat.',
    aiInsight: 'Background technical Anda cocok untuk transisi ke DevOps.'
  },
  {
    id: '6',
    role: 'Data Analyst',
    company: 'Analytics Pro',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AP',
    location: 'Yogyakarta, Indonesia',
    salary: 'Rp 10-15 juta/bulan',
    type: 'Hybrid',
    matchScore: 72,
    requiredSkills: ['Python', 'SQL', 'Tableau', 'Statistics'],
    description: 'Menganalisis data untuk memberikan insights bisnis yang actionable.',
    aiInsight: 'Skill analytical Anda dapat dikembangkan untuk role ini.'
  },
  {
    id: '7',
    role: 'Mobile Developer',
    company: 'App Innovators',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=AI',
    location: 'Jakarta, Indonesia',
    salary: 'Rp 14-22 juta/bulan',
    type: 'Hybrid',
    matchScore: 88,
    requiredSkills: ['React Native', 'iOS', 'Android', 'Firebase'],
    description: 'Membangun aplikasi mobile yang digunakan oleh jutaan pengguna.',
    aiInsight: 'Pengalaman React Anda mudah ditransfer ke React Native.'
  },
  {
    id: '8',
    role: 'Marketing Intern',
    company: 'Startup Hub',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SH',
    location: 'Bali, Indonesia',
    salary: 'Rp 5-7 juta/bulan',
    type: 'Onsite',
    matchScore: 65,
    requiredSkills: ['Social Media', 'Content Writing', 'SEO', 'Analytics'],
    description: 'Peluang magang untuk fresh graduate yang passionate tentang digital marketing.',
    aiInsight: 'Entry point yang bagus untuk memulai karir di bidang marketing.'
  }
];

const JobMate = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const filters = [
    { id: 'top-match', label: 'Top Match (>90%)', condition: (job: Job) => job.matchScore > 90 },
    { id: 'remote', label: 'Remote Only', condition: (job: Job) => job.type === 'Remote' },
    { id: 'high-salary', label: 'High Salary', condition: (job: Job) => parseInt(job.salary.replace(/\D/g, '')) > 15 },
    { id: 'internship', label: 'Internship', condition: (job: Job) => job.role.toLowerCase().includes('intern') }
  ];

  const filteredJobs = JOB_DATA
    .filter(job => {
      const matchesSearch = job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter 
        ? filters.find(f => f.id === selectedFilter)?.condition(job) 
        : true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10';
    return 'text-slate-500 bg-slate-500/10';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    return 'Potential Match';
  };

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsApplying(false);
    setShowApplyModal(false);
    
    toast({
      title: "Lamaran Berhasil Dikirim! ✈️",
      description: `CV Anda telah dikirim ke ${selectedJob?.company}. Good luck!`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/cvmate/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                JobMate
              </h1>
            </div>
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Pekerjaan yang Cocok untuk <span className="text-primary">Anda</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Berdasarkan analisis CV terbaru Anda, Anda memiliki peluang lolos tinggi di perusahaan berikut.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari posisi lain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? 'default' : 'outline'}
                onClick={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Job Cards Grid */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="mb-6"
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                  <div className="flex gap-6">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      <img 
                        src={job.logo} 
                        alt={job.company}
                        className="w-16 h-16 rounded-lg border border-border"
                      />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{job.role}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </span>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className={`flex flex-col items-center px-4 py-2 rounded-xl ${getMatchColor(job.matchScore)}`}>
                          <div className="text-2xl font-bold">{job.matchScore}%</div>
                          <div className="text-xs font-medium">{getMatchLabel(job.matchScore)}</div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">{job.description}</p>

                      {/* AI Insight */}
                      <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg mb-4">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-primary font-medium">{job.aiInsight}</p>
                      </div>

                      {/* Skills & Actions */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                          <Badge variant={job.type === 'Remote' ? 'default' : 'outline'}>
                            {job.type}
                          </Badge>
                          <Button 
                            onClick={() => handleApply(job)}
                            className="bg-gradient-primary"
                          >
                            Easy Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Tidak ada pekerjaan ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah kata kunci pencarian atau filter Anda</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Apply Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Konfirmasi Lamaran</DialogTitle>
          </DialogHeader>

          <div className="py-6">
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
              <img 
                src={selectedJob?.logo} 
                alt={selectedJob?.company}
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h4 className="font-semibold">{selectedJob?.role}</h4>
                <p className="text-sm text-muted-foreground">{selectedJob?.company}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium">CV Optimized</p>
                  <p className="text-sm text-muted-foreground">CV Anda telah dioptimalkan dengan CareerMate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium">Match Score: {selectedJob?.matchScore}%</p>
                  <p className="text-sm text-muted-foreground">Peluang lolos sangat tinggi</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-center">
                Kirim CV Optimized Anda ke <span className="text-primary font-bold">{selectedJob?.company}</span>?
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowApplyModal(false)}
                disabled={isApplying}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-gradient-primary"
                onClick={handleConfirmApply}
                disabled={isApplying}
              >
                {isApplying ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                    </motion.div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Kirim Lamaran Sekarang
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobMate;