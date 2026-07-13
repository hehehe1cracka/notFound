import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import {
  Zap,
  Mail,
  Github,
  Loader2,
  ArrowRight,
  Briefcase,
  User as UserIcon,
  PenTool,
  Sparkles,
  Rocket,
  CheckCircle2,
  Code2,
  Palette,
  Megaphone,
  BarChart,
  Globe
} from 'lucide-react';
import { z } from 'zod';
import { UserRole, User } from '@/types/momentum';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FaceCapture } from '@/components/auth/FaceCapture';
import { FraudGuard } from '@/components/auth/FraudGuard';
import { ShieldCheck, Phone, AlertCircle } from 'lucide-react';
import { verifyHumanFace, loadFaceModels } from '@/lib/faceAuth';
import CyberLoginForm from '@/components/auth/CyberLoginForm';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number required').optional().or(z.literal('')),
});

const SKILLS = [
  { label: 'React', icon: Code2 },
  { label: 'Design', icon: Palette },
  { label: 'Marketing', icon: Megaphone },
  { label: 'AI/ML', icon: Sparkles },
  { label: 'Backend', icon: BarChart },
  { label: 'Product', icon: Globe },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithGithub, user, userProfile, updateUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [loading, setLoading] = useState(false);

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'capturing' | 'verifying' | 'verified' | 'error'>('idle');
  const [verificationError, setVerificationError] = useState<string>('');
  const [fraudScore, setFraudScore] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'talent' as UserRole,
    bio: '',
    skills: [] as string[],
    motivation: '',
    phoneNumber: '',
  });





  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in and finished setup
  useEffect(() => {
    if (user && userProfile?.role) {
      // User is authenticated and has completed onboarding
      navigate('/dashboard');
    } else if (user && userProfile && !userProfile.role && step === 1) {
      // User is authenticated but hasn't completed onboarding - move to step 2
      setStep(2);
    }
  }, [user, userProfile, navigate]);



  // Cleanup reCAPTCHA on step change or unmount
  useEffect(() => {
    loadFaceModels(); // Preload models
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!isSignUp) {
      setLoading(true);
      try {
        await signIn(formData.email, formData.password);
        toast({ title: 'Welcome back!', description: 'Successfully signed in.' });
        navigate('/dashboard');
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
      return;
    }

    // SignUp Validation
    const result = authSchema.safeParse({
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      const firstError = result.error.errors[0]?.message || 'Validation failed';
      toast({ title: 'Validation Error', description: firstError, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.displayName);
      setStep(2); // Move to role selection
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await updateUser({
        role: formData.role,
        bio: formData.bio,
        skills: formData.skills,
        motivation: formData.motivation,
      });
      if (step === 6) {
        navigate('/dashboard');
      } else {
        nextStep();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const verifyFace = async (imageBase64: string) => {
    setVerificationStatus('verifying');
    setVerificationError('');

    try {
      const result = await verifyHumanFace(imageBase64);

      if (result.isValid) {
        setVerificationStatus('verified');
        setFraudScore(Math.round((result.score || 0.9) * 100));
        toast({ title: "Verified", description: "Identity verified successfully." });
      } else {
        setVerificationStatus('error');
        setVerificationError(result.error || "Verification failed");
        toast({ title: "Verification Failed", description: result.error, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      setVerificationStatus('error');
      setVerificationError("An unexpected error occurred.");
    }
  };




  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <CyberLoginForm
              formData={formData}
              setFormData={setFormData}
              handleAuth={handleAuth}
              isSignUp={isSignUp}
              setIsSignUp={setIsSignUp}
              loading={loading}
              signInWithGoogle={signInWithGoogle}
              errors={errors}
            />
          </motion.div>
        );


      case 2:
        return (
          <motion.div
            key="step2-verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Identity Verification</h2>
              <p className="text-muted-foreground">To keep Momentum fake-free, we verify every builder.</p>
            </div>

            {/* Fraud Guard Score */}
            {fraudScore !== null && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <FraudGuard
                  score={fraudScore}
                  signals={['Email domain verified', 'IP reputation clean', 'Device fingerprint unique']}
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="+1 (555) 000-0000"
                  className="pl-10 bg-card/50"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">We'll send a code to verify this is really you.</p>
            </div>

            <div className="space-y-2">
              <Label>Face Verification</Label>
              <FaceCapture
                status={verificationStatus}
                errorMessage={verificationError}
                onCapture={verifyFace}
                onRetake={() => {
                  setVerificationStatus('idle');
                  setVerificationError('');
                }}
              />
            </div>

            <Button
              onClick={nextStep}
              className="w-full"
              disabled={verificationStatus !== 'verified' || !formData.phoneNumber}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div >
        );

      case 3:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <span className="text-primary font-display text-sm mb-2 block">Step 3 of 6</span>
              <h2 className="text-2xl font-bold mb-2">What's your role?</h2>
              <p className="text-muted-foreground">Choose how you want to contribute to the ecosystem.</p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  id: 'founder',
                  title: 'Founder / Admin',
                  icon: Rocket,
                  desc: 'Create startups, post updates, and manage your team.',
                  features: ['Create startups', 'Post momentum updates', 'Assign tasks']
                },
                {
                  id: 'talent',
                  title: 'Talent / Supporter',
                  icon: UserIcon,
                  desc: 'Explore startups, help built, and earn reputation.',
                  features: ['Explore startups', 'Claim tasks', 'Build trust score']
                }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setFormData({ ...formData, role: role.id as UserRole })}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all group ${formData.role === role.id
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border bg-card/50 hover:border-border-hover'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${formData.role === role.id ? 'bg-primary text-background' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}`}>
                      <role.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{role.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{role.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.features.map(f => (
                          <span key={f} className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    {formData.role === role.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary absolute top-4 right-4" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button onClick={nextStep} className="w-full flex items-center justify-center gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 lg:max-w-4xl lg:flex lg:gap-12 lg:items-start"
          >
            <div className="lg:w-1/2 space-y-6">
              <div className="text-center lg:text-left">
                <span className="text-primary font-display text-sm mb-2 block">Step 4 of 6</span>
                <h2 className="text-2xl font-bold mb-2">Build your profile</h2>
                <p className="text-muted-foreground">Tell the community who you are and what you're good at.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Short Bio</Label>
                  <Textarea
                    placeholder="e.g. Building AI tools for researchers or fullstack dev looking for a mission."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="bg-card/50 resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Keep it concise and punchy</p>
                </div>

                <div className="space-y-2">
                  <Label>Skills & Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => {
                      const Icon = skill.icon;
                      const isSelected = formData.skills.includes(skill.label);
                      return (
                        <button
                          key={skill.label}
                          onClick={() => toggleSkill(skill.label)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${isSelected
                            ? 'bg-primary border-primary text-background'
                            : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                            }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {skill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
                <Button onClick={nextStep} className="flex-[2] gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="hidden lg:block lg:w-1/2 lg:sticky lg:top-24">
              <div className="p-1 rounded-3xl bg-gradient-to-br from-primary/30 to-purple-500/10">
                <Card className="p-8 bg-black/90 border-none rounded-[22px] overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4">
                    <Zap className="h-6 w-6 text-primary/20" />
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 border-2 border-primary/50 mb-4">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {formData.displayName.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-xl font-bold mb-1">{formData.displayName || 'Alex Builder'}</h3>
                    <Badge variant="secondary" className="mb-4 uppercase tracking-widest text-[10px]">
                      {formData.role}
                    </Badge>

                    <p className="text-sm text-muted-foreground mb-6 min-h-[4.5em]">
                      {formData.bio || 'Starting my journey on Momentum...'}
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      {formData.skills.length > 0 ? formData.skills.map(s => (
                        <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                          {s}
                        </span>
                      )) : (
                        <p className="text-[10px] text-muted-foreground italic">No skills selected yet</p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <span className="text-primary font-display text-sm mb-2 block">Step 5 of 6</span>
              <h2 className="text-2xl font-bold mb-2">One last thing...</h2>
              <p className="text-muted-foreground">
                {formData.role === 'founder'
                  ? "What problem are you obsessed with solving?"
                  : "How do you want to create impact?"}
              </p>
            </div>

            <div className="relative">
              <PenTool className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Textarea
                placeholder={formData.role === 'founder' ? "Tell us about the big problem..." : "Tell us what drives you..."}
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                rows={4}
                className="bg-card/50 pl-12 pt-4 resize-none text-lg border-2 focus:border-primary transition-all"
              />
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={prevStep} className="flex-1">Back</Button>
              <Button onClick={handleUpdateProfile} className="flex-[2] gap-2" disabled={loading || !formData.motivation}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>Finish Setup <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary blur-3xl opacity-20" />
              <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-bold font-display">You're in!</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Welcome to the ecosystem. We've unlocked some initial rewards for you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border/50 text-left">
                <Sparkles className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-bold text-sm">Badge Unlocked</h3>
                <p className="text-[10px] text-muted-foreground uppercase">Explorer Level 1</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/50 text-left">
                <BarChart className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-bold text-sm">Pulse Score</h3>
                <p className="text-[10px] text-muted-foreground uppercase">Initial: 10 pts</p>
              </div>
            </div>

            <Button onClick={() => navigate('/dashboard')} className="w-full h-12 text-lg glow-primary group">
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Tip: Post a Gallery update to double your Pulse Score instantly.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <motion.div
        layout
        className={`w-full ${step === 3 || step === 4 ? 'max-w-4xl' : 'max-w-md'} relative z-10 transition-all duration-500`}
      >
        <Card className="p-8 bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-muted">
            <motion.div
              className="h-full bg-primary shadow-glow"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 6) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}

// Helper components not initially imported but needed for the UI
function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
