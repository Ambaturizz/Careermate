import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import BrandMark from '@/components/BrandMark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { registerWithPassword, signInWithPassword, type AuthResult } from '@/lib/auth-client';

type Mode = 'login' | 'register';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: () => mode === 'login'
      ? signInWithPassword(email.trim(), password)
      : registerWithPassword(fullName.trim(), email.trim(), password),
    onSuccess: (result: AuthResult) => {
      if (result.status === 'verification_required') {
        setMessage('Akun berhasil dibuat. Periksa email Anda untuk verifikasi, lalu masuk.');
        setMode('login');
        setSearchParams({ mode: 'login' });
        setPassword('');
        setConfirmPassword('');
        return;
      }
      navigate('/dashboard');
    },
  });

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode });
    setMessage('');
    mutation.reset();
  };
  const passwordsMatch = mode === 'login' || password === confirmPassword;
  const minimumPasswordLength = mode === 'login' ? 5 : 8;
  const canSubmit = email.trim() && password.length >= minimumPasswordLength && passwordsMatch && (mode === 'login' || fullName.trim().length >= 2);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-primary/5 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-3 flex items-center gap-2"><BrandMark className="h-10 w-10" /><span className="text-2xl font-bold text-primary">CareerMate</span></Link>
          <CardTitle className="text-2xl">{mode === 'login' ? 'Masuk ke akun Anda' : 'Buat akun baru'}</CardTitle>
          <p className="text-sm text-muted-foreground">{mode === 'login' ? 'Lanjutkan progres karier Anda di CareerMate.' : 'Mulai persiapan karier Anda dalam satu akun.'}</p>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid grid-cols-2 rounded-lg bg-muted p-1">
            <Button type="button" variant={mode === 'login' ? 'default' : 'ghost'} size="sm" onClick={() => changeMode('login')}>Masuk</Button>
            <Button type="button" variant={mode === 'register' ? 'default' : 'ghost'} size="sm" onClick={() => changeMode('register')}>Daftar</Button>
          </div>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (canSubmit) mutation.mutate(); }}>
            {mode === 'register' && <div><label htmlFor="auth-name" className="mb-2 block text-sm font-medium">Nama lengkap</label><Input id="auth-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} maxLength={80} /></div>}
            <div><label htmlFor="auth-email" className="mb-2 block text-sm font-medium">Email</label><Input id="auth-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div>
              <label htmlFor="auth-password" className="mb-2 block text-sm font-medium">Kata sandi</label>
              <div className="relative"><Input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="pr-10" required minLength={minimumPasswordLength} maxLength={72} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            {mode === 'register' && <div><label htmlFor="auth-confirm" className="mb-2 block text-sm font-medium">Ulangi kata sandi</label><Input id="auth-confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />{confirmPassword && !passwordsMatch && <p className="mt-2 text-sm text-destructive">Kata sandi belum sama.</p>}</div>}
            {message && <p className="rounded-lg bg-accent/10 p-3 text-sm text-accent">{message}</p>}
            {mutation.isError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{mutation.error instanceof Error ? mutation.error.message : 'Permintaan akun gagal.'}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memproses...</> : mode === 'login' ? <><LogIn className="mr-2 h-5 w-5" />Masuk</> : <><UserPlus className="mr-2 h-5 w-5" />Buat akun</>}
            </Button>
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" />Autentikasi diproses melalui backend CareerMate dan token digunakan untuk mengakses data akun Anda.</div>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="h-3.5 w-3.5" />Mode development tetap dapat memakai identity fixture lokal.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
