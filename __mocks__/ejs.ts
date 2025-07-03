import { vi } from 'vitest'
export default {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderFile: vi.fn().mockImplementation((...args: any[]) => args.pop()())
}
