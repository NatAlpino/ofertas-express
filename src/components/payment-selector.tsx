'use client'

import type { PaymentMethod } from '@/services/types'

const methods: Array<{
  value: PaymentMethod
  label: string
  hint: string
}> = [
  { value: 'pix', label: 'Pix', hint: 'Pagamento instantâneo' },
  { value: 'boleto', label: 'Boleto', hint: 'Vencimento em 3 dias úteis' },
]

export function PaymentSelector({
  value,
  onChange,
}: {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}) {
  return (
    <fieldset className="mt-6 rounded-card border border-border bg-white p-4">
      <legend className="px-1 text-sm font-semibold text-ink">Forma de pagamento</legend>
      <div className="grid gap-3">
        {methods.map((method) => (
          <label
            key={method.value}
            className={`flex cursor-pointer items-center gap-3 rounded-card border-2 p-3 transition-colors ${
              value === method.value
                ? 'border-primary bg-primary-light'
                : 'border-border bg-white hover:border-primary'
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.value}
              checked={value === method.value}
              onChange={() => onChange(method.value)}
              className="h-4 w-4 accent-[#0d9488]"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">{method.label}</span>
              <span className="block text-xs text-ink-soft">{method.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
