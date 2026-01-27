/**
 * Safe expression evaluator for calculated fields.
 * Does NOT use eval() or new Function() - parses and evaluates expressions safely.
 * Only supports numeric operations and predefined functions.
 */

type TokenType = 'NUMBER' | 'OPERATOR' | 'FUNCTION' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'EOF'

interface Token {
  type: TokenType
  value: string | number
}

// Supported functions with their implementations
const FUNCTIONS: Record<string, (...args: number[]) => number> = {
  avg: (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
  sum: (...args: number[]) => args.reduce((a, b) => a + b, 0),
  min: (...args: number[]) => Math.min(...args),
  max: (...args: number[]) => Math.max(...args),
  abs: (x: number) => Math.abs(x),
  round: (val: number, decimals: number = 0) => {
    const factor = Math.pow(10, decimals)
    return Math.round(val * factor) / factor
  },
  sqrt: (x: number) => Math.sqrt(x),
  pow: (base: number, exp: number) => Math.pow(base, exp),
  power: (base: number, exp: number) => Math.pow(base, exp),
  index: (val: number, base: number) => (val / base) * 100,
}

// Operator precedence
const PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
}

/**
 * Tokenize expression string
 */
function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expression.length) {
    const char = expression[i]

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Numbers (including decimals)
    if (/[0-9.]/.test(char)) {
      let numStr = ''
      while (i < expression.length && /[0-9.]/.test(expression[i])) {
        numStr += expression[i]
        i++
      }
      const num = parseFloat(numStr)
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${numStr}`)
      }
      tokens.push({ type: 'NUMBER', value: num })
      continue
    }

    // Functions (alphabetic identifiers)
    if (/[a-zA-Z_]/.test(char)) {
      let funcName = ''
      while (i < expression.length && /[a-zA-Z_0-9]/.test(expression[i])) {
        funcName += expression[i]
        i++
      }
      tokens.push({ type: 'FUNCTION', value: funcName.toLowerCase() })
      continue
    }

    // Operators
    if (['+', '-', '*', '/'].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char })
      i++
      continue
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' })
      i++
      continue
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' })
      i++
      continue
    }

    // Comma (for function arguments)
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' })
      i++
      continue
    }

    throw new Error(`Unexpected character: ${char}`)
  }

  tokens.push({ type: 'EOF', value: '' })
  return tokens
}

/**
 * Recursive descent parser and evaluator
 */
class ExpressionParser {
  private tokens: Token[]
  private pos: number = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private current(): Token {
    return this.tokens[this.pos]
  }

  private consume(type?: TokenType): Token {
    const token = this.current()
    if (type && token.type !== type) {
      throw new Error(`Expected ${type}, got ${token.type}`)
    }
    this.pos++
    return token
  }

  // Reserved for future use in expression parsing
  /* private peek(): Token {
    return this.tokens[this.pos + 1]
  } */

  parse(): number {
    const result = this.parseExpression()
    if (this.current().type !== 'EOF') {
      throw new Error('Unexpected tokens at end of expression')
    }
    return result
  }

  private parseExpression(): number {
    return this.parseBinaryOp(this.parseTerm(), 0)
  }

  private parseBinaryOp(left: number, minPrecedence: number): number {
    while (
      this.current().type === 'OPERATOR' &&
      PRECEDENCE[this.current().value as string] >= minPrecedence
    ) {
      const op = this.consume('OPERATOR').value as string
      const precedence = PRECEDENCE[op]
      let right = this.parseTerm()

      while (
        this.current().type === 'OPERATOR' &&
        PRECEDENCE[this.current().value as string] > precedence
      ) {
        right = this.parseBinaryOp(right, PRECEDENCE[this.current().value as string])
      }

      switch (op) {
        case '+': left = left + right; break
        case '-': left = left - right; break
        case '*': left = left * right; break
        case '/': left = left / right; break
      }
    }
    return left
  }

  private parseTerm(): number {
    const token = this.current()

    // Unary minus
    if (token.type === 'OPERATOR' && token.value === '-') {
      this.consume()
      return -this.parseTerm()
    }

    // Number
    if (token.type === 'NUMBER') {
      return this.consume('NUMBER').value as number
    }

    // Function call
    if (token.type === 'FUNCTION') {
      const funcName = this.consume('FUNCTION').value as string
      const func = FUNCTIONS[funcName]
      if (!func) {
        throw new Error(`Unknown function: ${funcName}`)
      }

      this.consume('LPAREN')
      const args: number[] = []

      if (this.current().type !== 'RPAREN') {
        args.push(this.parseExpression())
        while (this.current().type === 'COMMA') {
          this.consume('COMMA')
          args.push(this.parseExpression())
        }
      }

      this.consume('RPAREN')
      return func(...args)
    }

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      this.consume('LPAREN')
      const result = this.parseExpression()
      this.consume('RPAREN')
      return result
    }

    throw new Error(`Unexpected token: ${token.type}`)
  }
}

/**
 * Safely evaluate a mathematical expression.
 * Only supports numbers, basic operators (+, -, *, /), and predefined functions.
 * Does NOT use eval() or new Function().
 *
 * @param expression - The expression to evaluate
 * @returns The numeric result or null if evaluation fails
 */
export function safeEvaluate(expression: string): number | null {
  try {
    // Sanitize: only allow safe characters
    if (!/^[\d\s+\-*/().a-zA-Z_,]+$/.test(expression)) {
      return null
    }

    const tokens = tokenize(expression)
    const parser = new ExpressionParser(tokens)
    const result = parser.parse()

    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return null
    }

    return result
  } catch {
    return null
  }
}

/**
 * List of supported functions for display in UI
 */
export const SUPPORTED_FUNCTIONS = Object.keys(FUNCTIONS)
