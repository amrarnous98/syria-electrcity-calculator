import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Menu, X, Calculator as CalculatorIcon, Zap, AlertCircle, Building2, DollarSign } from 'lucide-react'

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [prevReading, setPrevReading] = useState('')
  const [currReading, setCurrReading] = useState('')
  const [months, setMonths] = useState('2')
  const [instMode, setInstMode] = useState(false)
  const [instCategory, setInstCategory] = useState('standard')
  const [exchangeRate, setExchangeRate] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const tariffs = {
    household: { threshold: 300, tier1: 600, tier2: 1400, defaultMonths: 2 },
    institution: { categories: { standard: 1700, premium: 1800 } },
  }

  const scrollToCalc = () => {
    const el = document.getElementById('calculator')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  const resetAll = () => {
    setPrevReading('')
    setCurrReading('')
    setMonths(String(tariffs.household.defaultMonths))
    setInstMode(false)
    setInstCategory('standard')
    setExchangeRate('')
    setError('')
    setResult(null)
  }

  const validate = () => {
    const prev = Number(prevReading)
    const curr = Number(currReading)
    const m = months === '' ? tariffs.household.defaultMonths : Number(months)
    if (!Number.isFinite(prev) || !Number.isFinite(curr)) return 'يرجى إدخال أرقام صحيحة لقراءات العداد.'
    if (prev < 0 || curr < 0) return 'لا يمكن أن تكون القراءات سالبة.'
    if (curr < prev) return 'لا يجوز أن تكون القراءة الحالية أقل من السابقة.'
    if (!Number.isFinite(m) || m <= 0) return 'مدة الفاتورة (بالأشهر) يجب أن تكون رقماً موجباً.'
    return ''
  }

  const compute = () => {
    const err = validate()
    if (err) {
      setError(err)
      setResult(null)
      return
    }
    setError('')
    const prev = Number(prevReading)
    const curr = Number(currReading)
    const m = months === '' ? tariffs.household.defaultMonths : Number(months)
    const consumption = curr - prev

    let tier1kwh = 0
    let tier2kwh = 0
    let total = 0
    let categoryLabel = ''

    if (instMode) {
      const rate = tariffs.institution.categories[instCategory] || tariffs.institution.categories.standard
      total = consumption * rate
      tier1kwh = consumption
      categoryLabel = `مؤسسة/منشأة – ${instCategory === 'premium' ? 'مميز (1,800 ل.س/ك.و.س)' : 'قياسي (1,700 ل.س/ك.و.س)'}`
    } else {
      const threshold = tariffs.household.threshold
      const rate1 = tariffs.household.tier1
      const rate2 = tariffs.household.tier2
      tier1kwh = Math.min(consumption, threshold)
      tier2kwh = Math.max(consumption - threshold, 0)
      total = tier1kwh * rate1 + tier2kwh * rate2
      categoryLabel = `منزلي – ${consumption <= threshold ? `حتى ${threshold} ك.و.س` : `فوق ${threshold} ك.و.س`}`
    }

    let usd = null
    const fx = Number(exchangeRate)
    if (exchangeRate !== '' && Number.isFinite(fx) && fx > 0) {
      usd = total / fx
    }

    setResult({
      consumption,
      months: m,
      avgPerMonth: consumption / m,
      tier1kwh,
      tier2kwh,
      total,
      usd,
      categoryLabel,
    })
  }

  const formatSYP = (v) => new Intl.NumberFormat('ar-SY', { maximumFractionDigits: 0 }).format(Math.round(v))
  const formatUSD = (v) => new Intl.NumberFormat('ar', { style: 'currency', currency: 'USD' }).format(v)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="font-semibold text-sm sm:text-base">حاسبة فاتورة الكهرباء – سوريا </span>
            </div>
            <button
              className="md:hidden p-3 rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="تبديل القائمة"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center gap-4">
              <Button size="sm" className="hidden sm:inline-flex" onClick={scrollToCalc}>
                <CalculatorIcon className="h-4 w-4" />
                الحاسبة
              </Button>
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden pb-3 space-y-1 border-t">
              <button className="block w-full text-right py-2 px-3 rounded hover:bg-accent" onClick={scrollToCalc}>
                الحاسبة
              </button>
              <a href="#about" className="block py-2 px-3 rounded hover:bg-accent" onClick={() => setMobileOpen(false)}>
                حول
              </a>
              <div className="px-3 pt-1">
                <Button className="w-full" onClick={scrollToCalc}>
                  <CalculatorIcon className="h-4 w-4" />
                  ابدأ
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        <section id="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalculatorIcon className="h-5 w-5" />
                حاسبة فاتورة الكهرباء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prev">قراءة العداد السابقة (ك.و.س)</Label>
                  <Input id="prev" inputMode="decimal" type="number" placeholder="مثال: 12500"
                    className="text-right"
                    value={prevReading} onChange={(e) => setPrevReading(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="curr">قراءة العداد الحالية (ك.و.س)</Label>
                  <Input id="curr" inputMode="decimal" type="number" placeholder="مثال: 12980"
                    className="text-right"
                    value={currReading} onChange={(e) => setCurrReading(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="months">مدة الفاتورة (بالأشهر)</Label>
                  <Input id="months" inputMode="decimal" type="number" min="1" placeholder={`${tariffs.household.defaultMonths}`}
                    className="text-right"
                    value={months} onChange={(e) => setMonths(e.target.value)} />
                  <p className="text-xs text-muted-foreground">القيمة الافتراضية {tariffs.household.defaultMonths} أشهر.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fx">سعر الصرف (ل.س لكل دولار) — اختياري</Label>
                  <Input id="fx" inputMode="decimal" type="number" placeholder="مثال: 14500"
                    className="text-right"
                    value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
                  <p className="text-xs text-muted-foreground">يُستخدم لتحويل المجموع إلى الدولار في حال إدخاله.</p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch id="inst" checked={instMode} onCheckedChange={setInstMode} aria-label="وضع المؤسسة/المنشأة" />
                  <div>
                    <Label htmlFor="inst" className="cursor-pointer">مؤسسة / منشأة / صناعة</Label>
                    <p className="text-xs text-muted-foreground">تطبيق تعرفة مؤسساتية ثابتة.</p>
                  </div>
                </div>

                {instMode && (
                  <div className="w-full sm:w-auto">
                    <Label className="sr-only">فئة المؤسسة</Label>
                    <Tabs value={instCategory} onValueChange={setInstCategory}>
                      <TabsList>
                        <TabsTrigger value="standard" className="min-w-[140px]">قياسي · 1,700</TabsTrigger>
                        <TabsTrigger value="premium" className="min-w-[140px]">مميز · 1,800</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>خطأ في الإدخال</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 sm:flex-none" onClick={compute}>
                  <Zap className="h-4 w-4" />
                  احسب
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none" onClick={resetAll}>
                  مسح
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  النتائج
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground">الاستهلاك الكلي</div>
                    <div className="text-2xl font-semibold">{formatSYP(result.consumption)} ك.و.س</div>
                    <div className="text-xs text-muted-foreground mt-1">المتوسط شهريًا: {result.avgPerMonth.toFixed(1)} ك.و.س • المدة: {result.months} أشهر</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground">الفئة</div>
                    <div className="text-base font-medium">{result.categoryLabel}</div>
                  </div>
                  {!instMode ? (
                    <>
                      <div className="rounded-md border p-4">
                        <div className="text-sm text-muted-foreground">الشريحة 1 (≤ {tariffs.household.threshold} ك.و.س) @ {formatSYP(tariffs.household.tier1)} ل.س/ك.و.س</div>
                        <div className="text-xl font-semibold">{formatSYP(result.tier1kwh)} ك.و.س</div>
                      </div>
                      <div className="rounded-md border p-4">
                        <div className="text-sm text-muted-foreground">الشريحة 2 (> {tariffs.household.threshold} ك.و.س) @ {formatSYP(tariffs.household.tier2)} ل.س/ك.و.س</div>
                        <div className="text-xl font-semibold">{formatSYP(result.tier2kwh)} ك.و.س</div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md border p-4 sm:col-span-2">
                      <div className="text-sm text-muted-foreground">تعرفة ثابتة @ {formatSYP(tariffs.institution.categories[instCategory])} ل.س/ك.و.س</div>
                      <div className="text-xl font-semibold">{formatSYP(result.tier1kwh)} ك.و.س</div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground">المجموع</div>
                    <div className="text-2xl font-bold">{formatSYP(result.total)} ل.س</div>
                  </div>
                  <div className="rounded-md border p-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      التحويل (دولار أمريكي)
                    </div>
                    <div className="text-xl font-semibold">
                      {result.usd != null ? formatUSD(result.usd) : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {exchangeRate ? `اعتماد سعر: ${formatSYP(Number(exchangeRate))} ل.س/دولار` : 'أدخل سعر الصرف لإظهار التحويل'}
                    </div>
                  </div>
                </div>

                <Alert className="bg-muted/40">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>ملاحظة</AlertTitle>
                  <AlertDescription>
                    هذه الأداة تطبق الشرائح المنزلية أو التعرفة الثابتة للمؤسسات كما هو مُعرّف لعام 2025. النتائج تقديرية فقط.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </section>

        <section id="about" className="mt-10 text-sm text-muted-foreground">
          <p>
            حد الشريحة المنزلية: {tariffs.household.threshold} ك.و.س
            <br></br>
            الأسعار: {formatSYP(tariffs.household.tier1)} و {formatSYP(tariffs.household.tier2)} ل.س/ك.و.س. فئات المؤسسات: {formatSYP(tariffs.institution.categories.standard)} و {formatSYP(tariffs.institution.categories.premium)} ل.س/ك.و.س.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
