import { createHmac } from 'node:crypto'

// ----------------------------------------------------------------------------
// Validação da assinatura X-Twilio-Signature, sem depender do SDK oficial da
// Twilio (evita puxar a lib inteira só para isso).
// Algoritmo: https://www.twilio.com/docs/usage/webhooks/webhooks-security
// ----------------------------------------------------------------------------
export function validateTwilioSignature(authToken: string, signature: string, url: string, params: Record<string, string>): boolean {
  const sortedKeys = Object.keys(params).sort()
  let data = url
  for (const key of sortedKeys) {
    data += key + params[key]
  }
  const expected = createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64')
  return timingSafeEqualStr(expected, signature)
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
