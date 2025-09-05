/**
 * Formatea un número como moneda
 * @param amount Cantidad a formatear
 * @returns String formateado como moneda (ej: "₲ 123.456")
 */
export function formatCurrency(amount: number): string {
  return `₲ ${amount.toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Formatea un número como porcentaje
 * @param value Valor entre 0 y 1
 * @returns String formateado como porcentaje (ej: "10%")
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}
