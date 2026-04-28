import { useState } from 'react'
import { Calculator, Info, Image as ImageIcon } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { Card } from '@shared/ui/card'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Switch } from '@shared/ui/switch'
import { Badge } from '@shared/ui/badge'

// Taxas Infinity Pay por parcela (%)
const INFINITY_FEES: Record<number, number> = {
  1: 4.2,
  2: 5.45,
  3: 6.7,
  4: 7.95,
  5: 9.2,
  6: 10.45,
  7: 11.7,
  8: 12.95,
  9: 13.56,
  10: 14.18,
  11: 14.8,
  12: 15.31,
}

interface SimulationResult {
  installments: number
  feeRate: number
  monthlyPayment: number
  clientPays: number
  youReceive: number
  feeAmount: number
}

function simulate(basePrice: number, installments: number, repassMode: boolean): SimulationResult {
  const feeRate = INFINITY_FEES[installments] || 0
  const feeAmount = basePrice * (feeRate / 100)

  if (repassMode) {
    const clientPays = basePrice + feeAmount
    return {
      installments,
      feeRate,
      monthlyPayment: clientPays / installments,
      clientPays,
      youReceive: basePrice,
      feeAmount,
    }
  }
  return {
    installments,
    feeRate,
    monthlyPayment: basePrice / installments,
    clientPays: basePrice,
    youReceive: basePrice - feeAmount,
    feeAmount,
  }
}

export function AdminSimulacoesPage() {
  const [basePrice, setBasePrice] = useState<number>(1000)
  const [installments, setInstallments] = useState<number>(1)
  const [repassMode, setRepassMode] = useState<boolean>(false)
  const [result, setResult] = useState<SimulationResult | null>(() =>
    simulate(1000, 1, false)
  )

  const handleSimulate = () => {
    if (basePrice > 0 && installments >= 1 && installments <= 12) {
      setResult(simulate(basePrice, installments, repassMode))
    }
  }

  const handleClear = () => {
    setBasePrice(1000)
    setInstallments(1)
    setRepassMode(false)
    setResult(null)
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value)

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="pl-10 sm:pl-0">
          <h1 className="text-xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="w-5 h-5 sm:w-8 sm:h-8 text-primary shrink-0" />
            <span>Simulação de Vendas</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Calcule o valor recebido com ou sem repasse de juros ao cliente
          </p>
        </div>

        {/* Card de Configuração */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Dados da simulação</h2>

            <div className="bg-muted/40 border-l-4 border-primary p-4 rounded-md">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                Link de Pagamento Infinity Pay
                <Info className="w-4 h-4 text-muted-foreground" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Taxas baseadas no sistema Infinity Pay
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Valor base (R$)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Select
                  value={installments.toString()}
                  onValueChange={(v) => setInstallments(Number(v))}
                >
                  <SelectTrigger id="installments">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Repasse de juros</Label>
              <div className="flex items-center gap-3 p-4 rounded-md bg-muted/40 border">
                <Switch
                  id="repassMode"
                  checked={repassMode}
                  onCheckedChange={setRepassMode}
                />
                <span className="text-sm text-muted-foreground">
                  {repassMode
                    ? 'Com repasse (cliente paga os juros)'
                    : 'Sem repasse (loja absorve os juros)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-3">
              <div className="grid grid-cols-2 gap-2 sm:contents">
                <Button onClick={handleSimulate} className="w-full sm:w-auto">Simular</Button>
                <Button onClick={handleSimulate} variant="secondary" className="w-full sm:w-auto">
                  Comparar cenários
                </Button>
              </div>
              <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
                Limpar
              </Button>
            </div>
          </div>
        </Card>

        {/* Card de Resultado */}
        {result && (
          <Card className="overflow-hidden p-0">
            <div className="bg-primary text-primary-foreground px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Resultado da simulação</h2>
                  <p className="text-primary-foreground/80 text-xs sm:text-sm mt-1">
                    Infinity Pay · {result.installments}x parcelas
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 shrink-0">
                  {repassMode ? 'Com repasse' : 'Sem repasse'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x">
              <div className="p-3 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-wider mb-2">
                  CLIENTE PAGA
                </p>
                <p className="text-base sm:text-2xl font-bold text-foreground break-words">
                  {formatCurrency(result.clientPays)}
                </p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">
                  {result.installments}x de {formatCurrency(result.monthlyPayment)}
                </p>
              </div>

              <div className="p-3 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-wider mb-2">
                  VALOR BASE
                </p>
                <p className="text-base sm:text-2xl font-bold text-foreground break-words">
                  {formatCurrency(basePrice)}
                </p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">Original da venda</p>
              </div>

              <div className="p-3 sm:p-6">
                <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground tracking-wider mb-2">
                  VOCÊ RECEBE
                </p>
                <p className="text-base sm:text-2xl font-bold text-foreground break-words">
                  {formatCurrency(result.youReceive)}
                </p>
                <p className="text-[11px] sm:text-sm text-muted-foreground mt-1">Valor líquido</p>
              </div>
            </div>

            <div className="p-6 space-y-4 border-t">
              <h3 className="font-semibold text-foreground">Detalhes</h3>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-muted-foreground">
                  Taxa retida pela operadora
                </span>
                <span className="font-semibold text-foreground">
                  -{formatCurrency(result.feeAmount)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {repassMode
                  ? 'O cliente paga o valor base acrescido da taxa. Você recebe o valor base cheio.'
                  : 'O cliente paga o valor base dividido em parcelas. A taxa é descontada do seu recebimento.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
                <Button className="gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Gerar imagem para o cliente
                </Button>
                <span className="text-sm text-muted-foreground">
                  Compartilhe os detalhes da simulação
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}


