import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@shared/ui/dialog'
import { Input } from '@shared/ui/input'
import { Button } from '@shared/ui/button'
import { useAdmin } from '@features/admin/viewmodel/AdminContext'

interface AdminLoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminLoginDialog({ open, onOpenChange }: Readonly<AdminLoginDialogProps>) {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(password, '')) {
      setPassword('')
      setError(false)
      onOpenChange(false)
      navigate('/')
    } else {
      setError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setPassword(''); setError(false) } }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Acesso administrativo
          </DialogTitle>
          <DialogDescription>
            Digite a senha para entrar no painel administrativo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            inputMode="numeric"
            autoFocus
            placeholder="Senha"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
          />
          {error && (
            <p className="text-sm text-destructive">Senha incorreta.</p>
          )}
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
